# Task Plan Protocol

## Overview

The bridge owns the authoritative thread task-plan list.
Every IDE adapter reads and updates the same logical structure.

## Evaluate request

`POST /plan/evaluate`

## Update progress

`POST /plan/progress`

## Heartbeat

`POST /sessions/heartbeat`

Used by IDE adapters to record active execution.

## Idle status

`GET /sessions/{threadId}/status`

Returns whether the task appears idle long enough to prompt the user.

## Chain diagnostics

`GET /diagnostics/chain?threadId=...`

Returns whether the local bridge is reachable, whether a retained thread plan exists, and whether the thread looks idle enough to recommend a wake-up.

## Wake signal

`POST /wake`

Issues a wake signal for the retained thread and returns diagnostics payload so an IDE adapter can decide whether to prompt for refresh.
