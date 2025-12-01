# Clockwork

Remember when things happened in your Homey flows and use that information to make smart decisions.

## Description

Clockwork is a Homey app that allows you to store timestamps of events and later check how long ago those events occurred. This is particularly useful for creating flows that need to differentiate between sequences of events or determine the order in which things happen.

## Use Cases

### Example: Smart Stairway Lighting

Detect the direction someone is walking on stairs by tracking the order of sensor triggers:

**Flow 1 - Store door opening event:**
- **When:** The stairway door contact sensor reports the door is open
- **Then:** Store that `my_unique_event_name` happened

**Flow 2 - Walking upstairs (door opens first, then motion):**
- **When:** Motion sensor on the staircase is triggered
- **And:** `my_unique_event_name` happened less than `10` `seconds` ago (default: False)
- **Then:** Turn the stairway lights on

**Flow 3 - Walking downstairs (motion first, then door):**
- **When:** The stairway door contact sensor reports the door is open
- **And:** Motion sensor triggered less than `10` `seconds` ago (default: False)
- **Then:** Turn the stairway lights off

### Other Examples

- Track when someone leaves home to trigger "welcome home" actions only after absences
- Monitor appliance usage patterns by storing start/stop times
- Create smart notifications that only trigger if certain events happened recently
- Build complex automation sequences that depend on event timing

## Features

### Trigger Cards

**"Event [event_id] was stored"**
- Triggers when any event (or a specific event) is stored
- Optional event ID filter to trigger only for specific events
- Provides `event_id` and `timestamp` tokens for use in flows

### Action Cards

**"Store that [event_id] happened"**
- Stores the current timestamp for any event identifier you choose
- Event IDs are persistent across app restarts
- Can be any text you want (e.g., `door_opened`, `motion_detected`, `user_left_home`)

**"Reset timestamp for [event_id]"**
- Removes the stored timestamp for an event
- The event will behave as if it never happened
- Useful for clearing event history

### Condition Cards

**Time-Based Comparisons:**
- **"[event_id] happened less than [time] [unit] ago"** - Check if event occurred recently
- **"[event_id] happened more than [time] [unit] ago"** - Check if event occurred long ago
- **"[event_id] happened between [min] and [max] [unit] ago"** - Check if event occurred within a time window

**Event Existence:**
- **"[event_id] has happened at least once"** - Check if event was ever recorded
- **"[event_id] has never happened"** - Check if event was never recorded

**Event Ordering:**
- **"[event_id_a] happened before [event_id_b]"** - Compare order of two events
- **"[event_id_a] happened after [event_id_b]"** - Compare order of two events
- **"[event_id_a] and [event_id_b] happened within [margin] of each other"** - Check if two events occurred at approximately the same time

#### Why the Default Value?

Most condition cards include a "default value" parameter. This is important because you cannot use `<=` or `>=` comparisons with `null` values. If an event has never occurred, the app needs to know whether your condition should pass (True) or fail (False). This allows you to create robust flows that handle both "event happened recently" and "event never happened" scenarios.

## Data Storage

All event timestamps are stored in Homey's persistent settings, which means:
- ✅ Data survives app restarts
- ✅ Data survives Homey reboots
- ✅ No external services required
- ✅ Privacy-focused (all data stays on your Homey)

## Installation

1. Install the app from the Homey App Store (recommended).
1. Or locally, run: `npm i -g homey` and `homey app install`.
