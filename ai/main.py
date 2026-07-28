"""
AI Scheduling Service — FastAPI + Clingo (Answer Set Programming)
POST /solve   → chạy solver, trả về thời khóa biểu
GET  /health  → health check
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import clingo
import os
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Timetable Solver", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic models ──────────────────────────────────────────

class Course(BaseModel):
    id: str
    room_type: str        # "normal" | "lab" | "computer"
    students: int

class LecturerAssignment(BaseModel):
    course_id: str
    lecturer_id: str

class Room(BaseModel):
    id: str
    room_type: str
    capacity: int

class BusySlot(BaseModel):
    lecturer_id: str
    day: int              # 1=Thứ 2 ... 6=Thứ 7
    period: int           # 1..10

class PreferSlot(BaseModel):
    lecturer_id: str
    day: int
    period: int
    is_prefer: bool       # True = thích, False = không thích

class SolveRequest(BaseModel):
    courses: list[Course]
    assignments: list[LecturerAssignment]
    rooms: list[Room]
    busy_slots: list[BusySlot]
    preference_slots: list[PreferSlot]
    sessions_per_course: dict[str, int]   # course_id → số tiết/tuần
    days: int = 5                         # số ngày học/tuần
    periods_per_day: int = 10             # số tiết/ngày
    timeout_seconds: int = 30

class AssignedSlot(BaseModel):
    course_id: str
    session: int
    day: int
    period: int
    room_id: str

class SolveResponse(BaseModel):
    status: str           # "sat" | "unsat" | "timeout" | "error"
    timetable: list[AssignedSlot]
    cost: int
    solve_time_ms: int
    message: str = ""

# ── Load ASP rules ───────────────────────────────────────────

ASP_FILE = os.path.join(os.path.dirname(__file__), "solver.lp")

def load_asp_rules() -> str:
    with open(ASP_FILE, "r", encoding="utf-8") as f:
        return f.read()

# ── Build facts từ request ───────────────────────────────────

def build_facts(req: SolveRequest) -> str:
    lines: list[str] = []

    # Slots
    for d in range(1, req.days + 1):
        for p in range(1, req.periods_per_day + 1):
            lines.append(f"slot({d},{p}).")

    # Courses
    for c in req.courses:
        lines.append(f'course("{c.id}","{c.room_type}",{c.students}).')

    # Rooms
    for r in req.rooms:
        lines.append(f'room("{r.id}","{r.room_type}",{r.capacity}).')

    # Assignments
    for a in req.assignments:
        lines.append(f'assignment("{a.course_id}","{a.lecturer_id}").')

    # Busy slots
    for b in req.busy_slots:
        lines.append(f'busy("{b.lecturer_id}",{b.day},{b.period}).')

    # Preference / dislike slots
    for pref in req.preference_slots:
        if pref.is_prefer:
            lines.append(f'prefer("{pref.lecturer_id}",{pref.day},{pref.period}).')
        else:
            lines.append(f'dislike("{pref.lecturer_id}",{pref.day},{pref.period}).')

    # Sessions per course
    for course_id, num_sessions in req.sessions_per_course.items():
        lines.append(f'sessions("{course_id}",{num_sessions}).')

    return "\n".join(lines)

# ── Parse kết quả từ Clingo ──────────────────────────────────

def parse_model(model: clingo.Model) -> list[AssignedSlot]:
    result = []
    for sym in model.symbols(shown=True):
        if sym.name == "assign" and len(sym.arguments) == 5:
            args = sym.arguments
            result.append(AssignedSlot(
                course_id=str(args[0]).strip('"'),
                session=int(str(args[1])),
                day=int(str(args[2])),
                period=int(str(args[3])),
                room_id=str(args[4]).strip('"'),
            ))
    return result

# ── Solver ───────────────────────────────────────────────────

def run_solver(req: SolveRequest) -> SolveResponse:
    start = time.time()
    asp_rules = load_asp_rules()
    facts = build_facts(req)
    program = asp_rules + "\n" + facts

    ctl = clingo.Control(["--opt-mode=optN", f"--time-limit={req.timeout_seconds}"])
    ctl.add("base", [], program)
    ctl.ground([("base", [])])

    best_model: list[AssignedSlot] = []
    best_cost = 999999
    status = "unsat"

    def on_model(model: clingo.Model):
        nonlocal best_model, best_cost, status
        if model.optimality_proven or model.cost:
            cost = sum(model.cost) if model.cost else 0
            if cost < best_cost:
                best_cost = cost
                best_model = parse_model(model)
                status = "sat"

    solve_handle = ctl.solve(on_model=on_model, async_=False)

    elapsed_ms = int((time.time() - start) * 1000)

    if solve_handle.unsatisfiable:
        status = "unsat"
        return SolveResponse(
            status="unsat",
            timetable=[],
            cost=0,
            solve_time_ms=elapsed_ms,
            message="Không tìm được lịch thỏa mãn ràng buộc cứng. Kiểm tra lại lịch bận GV hoặc số phòng.",
        )

    return SolveResponse(
        status=status,
        timetable=best_model,
        cost=best_cost if best_cost < 999999 else 0,
        solve_time_ms=elapsed_ms,
        message=f"Tìm được lịch tối ưu sau {elapsed_ms}ms",
    )

# ── Endpoints ────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "solver": "clingo"}

@app.post("/solve", response_model=SolveResponse)
def solve(req: SolveRequest):
    logger.info(f"Solving: {len(req.courses)} courses, {len(req.rooms)} rooms")
    try:
        return run_solver(req)
    except Exception as e:
        logger.error(f"Solver error: {e}")
        raise HTTPException(status_code=500, detail=str(e))