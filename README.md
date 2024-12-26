# HiPomo Discord bot - PLAN 

## OUR IDEAS
- booking body double sessions
- pomodoro timer with short and long breaks (5 or 15 mins)
- mutes members in channel when in focus mode

### USER FLOW - MVP 1

1. user calls bot by writing message 'hi pomo'
2. bot appears with welcome message
    - presents 2 options: 
        - short break: 25min focus, 5min break
        - long break: 25min focus, 15 min break
3. user selects either short or long break options
    - bot applies selection to specific channel user is in (for all members in channel)
4. timer for focus session starts
    - bot joins channel user is in
    - bot mutes everyone in channel
    - count down message appears
    - cancel session button appears
5. when focus timer finishes
    - timer bell sound plays 
    - bot unmutes everyone in channel
    - count down message changes to 'focus session finished'
    - break timer starts count down
6. if focus session is cancelled (user presses cancel button)
    - focus timer stops 
    - timer countdown message changes to 'focus session cancelled'
7. after break timer ends
    - message appears "thanks for using hipomo, call hi pomo to start again"