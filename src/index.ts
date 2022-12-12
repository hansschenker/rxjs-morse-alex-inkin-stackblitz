import "./style.css";

import {
  map,
  fromEvent,
  switchMap,
  filter,
  reduce,
  scan,
  takeUntil,
  timer,
  tap,
  take,
  interval,
  repeat,
  BehaviorSubject,
} from "rxjs";

const durationState = new BehaviorSubject<number[]>([])
const durationChanges = durationState.asObservable()
durationChanges.pipe(
  scan((acc, duration) =>[ ...acc , ...duration], ),
)
durationChanges.subscribe(duration => console.log('duration state:',duration))

// morse code words -------------------------------------------------------
const morseState = new BehaviorSubject<string[]>([])
const morseChanges =  morseState.asObservable();
morseChanges.pipe(
  scan((acc, char) =>[ ...acc , ...char], ),
).subscribe(s => console.log('morse state:',s));
// keypress up ---------------------------------------------------------------
const up$ = fromEvent(document, "keyup").pipe(
  map((e) => e.timeStamp),
  tap(interval(2000).pipe(
    take(1),
    tap( v => morseState.next(['/'])),
  )),
  );


// calculate duration between keydown timestamp and keyup timestamp --------------------------------
function durationToCode(duration: number): string {
  return duration > 1000 
    ? '/' 
    : duration > 200 
    ? '-' : '.'
}
  // keypress down ------------------------------------------------------------
const down$ = fromEvent<KeyboardEvent>(document, "keydown").pipe(
  filter((e) => !e.repeat),
  map((e) => e.timeStamp)
);
down$
  .pipe(
    switchMap((start) => up$.pipe(
      map((end) => end - start)
      )),
    tap( d => console.log('duration:',d)),
    tap( d => durationState.next([d])),
    map( duration => durationToCode(duration)),
    // map((duration) => (duration > 1000 
    //   ? '/' 
    //   : duration > 200 
    //   ? '-' : '.')),
    // map((duration) => (duration > 200 ? "-" : ".")),
    takeUntil(timer(1000).pipe(
      takeUntil(down$), 
      repeat()
      )),
    tap(c => morseState.next([c])),
    //scan((acc, char) => acc + char, ""),
    filter(Boolean),
    repeat()
  ).subscribe((v) => console.log("alex:", v));
  

console.log('duration-2000:',durationToCode(2000))
console.log('duration-300:',durationToCode(300))
console.log('duration-100:',durationToCode(100))