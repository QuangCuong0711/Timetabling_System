%%writefile encoding.lp

c(C) :- course(C,_,_,_,_,_).
t(T) :- course(_,T,_,_,_,_).
r(R) :- room(R,_,_).
d(0..D-1) :- days(D).
ppd(0..P-1) :- periods_per_day(P).
cu(Cu) :- curricula(Cu,_).

N { assigned(C,D,P) : d(D), ppd(P) } N :- course(C,_,N,_,_,_).

:- not { assigned(C,D,P) : course(C,T,_,_,_,_) } 1, t(T), d(D), ppd(P).
:- not { assigned(C,D,P) : curricula(Cu,C) } 1, cu(Cu), d(D), ppd(P).

1 { assigned(C,R,D,P) : r(R) } 1 :- assigned(C,D,P).
:- not { assigned(C,R,D,P) : c(C) } 1, r(R), d(D), ppd(P).

:- assigned(C,D,P), unavailability_constraint(C,D,P).


:- not { assigned(C,D,P) : c(C) } N, d(D), ppd(P), rooms(N).

using_room(C,R) :- assigned(C,R,D,P).
working_day(C,D) :- assigned(C,D,P).
scheduled_curricula(Cu,D,P) :- assigned(C,D,P), curricula(Cu,C).

:~ assigned(C,R,D,P), course(C,_,_,_,N,_), room(R,Cap,_), N > Cap. [N-Cap@1,C,R,D,P]

:~ course(C,_,_,MWD,_,_), N = { working_day(C,D) }, N < MWD. [5*(MWD-N)@1,C]

:~ scheduled_curricula(Cu,D,P), not scheduled_curricula(Cu,D,P-1), not scheduled_curricula(Cu,D,P+1). [2@1,Cu,D,P]

:~ c(C), N = { using_room(C,R) }, N > 1. [N-1@1,C]

#show assigned/4.