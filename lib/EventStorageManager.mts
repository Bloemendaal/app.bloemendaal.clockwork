import type ClockworkApp from "../app.mjs";

export class EventStorageManager {
	private readonly STORAGE_KEY = "event_timestamps";

	constructor(private readonly app: ClockworkApp) {}

	public storeEvent(eventId: string): number {
		const events = this.getAllEvents();
		const timestamp = Date.now();
		events[eventId] = timestamp;
		this.app.homey.settings.set(this.STORAGE_KEY, events);

		return timestamp;
	}

	public getEventTimestamp(eventId: string): number | null {
		const events = this.getAllEvents();
		return events[eventId] ?? null;
	}

	public resetEvent(eventId: string): void {
		const events = this.getAllEvents();

		if (eventId in events) {
			delete events[eventId];
			this.app.homey.settings.set(this.STORAGE_KEY, events);
		}
	}

	public getAllEventIds(): string[] {
		const events = this.getAllEvents();
		return Object.keys(events).sort();
	}

	private getAllEvents(): Record<string, number> {
		const events = this.app.homey.settings.get(this.STORAGE_KEY);
		return events ?? {};
	}

	public eventHappenedLessThan(
		eventId: string,
		milliseconds: number,
		defaultValue: boolean,
	): boolean {
		const timestamp = this.getEventTimestamp(eventId);

		if (timestamp === null) {
			return defaultValue;
		}

		return Date.now() - timestamp < milliseconds;
	}

	public eventHappenedMoreThan(
		eventId: string,
		milliseconds: number,
		defaultValue: boolean,
	): boolean {
		const timestamp = this.getEventTimestamp(eventId);

		if (timestamp === null) {
			return defaultValue;
		}

		return Date.now() - timestamp >= milliseconds;
	}

	public eventHappenedBetween(
		eventId: string,
		minMilliseconds: number,
		maxMilliseconds: number,
		defaultValue: boolean,
	): boolean {
		const timestamp = this.getEventTimestamp(eventId);

		if (timestamp === null) {
			return defaultValue;
		}

		const timeSinceEvent = Date.now() - timestamp;

		return (
			timeSinceEvent >= minMilliseconds && timeSinceEvent <= maxMilliseconds
		);
	}

	public eventsHappenedEqually(
		eventIdA: string,
		eventIdB: string,
		marginMilliseconds: number,
		defaultValue: boolean,
	): boolean {
		const timestampA = this.getEventTimestamp(eventIdA);
		const timestampB = this.getEventTimestamp(eventIdB);

		if (timestampA === null || timestampB === null) {
			return defaultValue;
		}

		return Math.abs(timestampA - timestampB) <= marginMilliseconds;
	}

	public eventAHappenedBeforeEventB(
		eventIdA: string,
		eventIdB: string,
		defaultValue: boolean,
	): boolean {
		const timestampA = this.getEventTimestamp(eventIdA);
		const timestampB = this.getEventTimestamp(eventIdB);

		if (timestampA === null || timestampB === null) {
			return defaultValue;
		}

		return timestampA < timestampB;
	}

	public eventNeverHappened(eventId: string): boolean {
		const timestamp = this.getEventTimestamp(eventId);

		return timestamp === null;
	}

	public eventHasHappened(eventId: string): boolean {
		const timestamp = this.getEventTimestamp(eventId);

		return timestamp !== null;
	}
}
