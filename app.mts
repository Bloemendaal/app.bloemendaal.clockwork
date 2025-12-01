import Homey from "homey";
import { EventStorageManager } from "./lib/EventStorageManager.mjs";

type TimeUnit = "seconds" | "minutes" | "hours" | "days";

interface StoreEventArgs {
	event_id: string;
}

interface EventHappenedCompareArgs {
	event_id: AutocompleteResult;
	time: number;
	unit: TimeUnit;
	default_value: "true" | "false";
}

interface EventHappenedBetweenArgs {
	event_id: AutocompleteResult;
	min_time: number;
	max_time: number;
	unit: TimeUnit;
	default_value: "true" | "false";
}

interface EventHappenedArgs {
	event_id: AutocompleteResult;
}

interface EventsHappenedCompareArgs {
	event_id_a: AutocompleteResult;
	event_id_b: AutocompleteResult;
	default_value: "true" | "false";
}

interface EventsHappenedEquallyArgs {
	event_id_a: AutocompleteResult;
	event_id_b: AutocompleteResult;
	margin: number;
	margin_unit: TimeUnit;
	default_value: "true" | "false";
}

interface EventStoredArgs {
	event_id?: AutocompleteResult;
}

interface AutocompleteResult {
	id: string;
	name: string;
	description?: string;
}

type AutocompleteEventId = string | { id: string; name: string };

export default class ClockworkApp extends Homey.App {
	private readonly storageManager: EventStorageManager =
		new EventStorageManager(this);

	public async onInit(): Promise<void> {
		const eventStoredTrigger = this.homey.flow.getTriggerCard("event_stored");

		eventStoredTrigger
			.registerArgumentAutocompleteListener(
				"event_id",
				this.autocomplete.bind(this),
			)
			.registerRunListener(async (args: EventStoredArgs, state) => {
				// If no specific event ID is selected, trigger for all events
				if (!args.event_id) {
					return true;
				}

				// Otherwise, only trigger if the event_id matches
				return state.event_id === this.getEventId(args.event_id);
			});

		this.homey.flow
			.getActionCard("store_event")
			.registerRunListener(async (args: StoreEventArgs) => {
				const timestamp = this.storageManager.storeEvent(args.event_id);

				await eventStoredTrigger
					.trigger(
						{
							event_id: args.event_id,
							timestamp: timestamp,
						},
						{
							event_id: args.event_id,
						},
					)
					.catch(this.error);
			});

		this.homey.flow
			.getActionCard("reset_event")
			.registerArgumentAutocompleteListener(
				"event_id",
				this.autocomplete.bind(this),
			)
			.registerRunListener(async (args: { event_id: AutocompleteEventId }) => {
				this.storageManager.resetEvent(this.getEventId(args.event_id));
			});

		this.homey.flow
			.getConditionCard("event_happened_less_than")
			.registerArgumentAutocompleteListener(
				"event_id",
				this.autocomplete.bind(this),
			)
			.registerRunListener(async (args: EventHappenedCompareArgs) =>
				this.storageManager.eventHappenedLessThan(
					this.getEventId(args.event_id),
					this.convertToMilliseconds(args.time, args.unit),
					args.default_value === "true",
				),
			);

		this.homey.flow
			.getConditionCard("event_happened_more_than")
			.registerArgumentAutocompleteListener(
				"event_id",
				this.autocomplete.bind(this),
			)
			.registerRunListener(async (args: EventHappenedCompareArgs) =>
				this.storageManager.eventHappenedMoreThan(
					this.getEventId(args.event_id),
					this.convertToMilliseconds(args.time, args.unit),
					args.default_value === "true",
				),
			);

		this.homey.flow
			.getConditionCard("event_happened_between")
			.registerArgumentAutocompleteListener(
				"event_id",
				this.autocomplete.bind(this),
			)
			.registerRunListener(async (args: EventHappenedBetweenArgs) =>
				this.storageManager.eventHappenedBetween(
					this.getEventId(args.event_id),
					this.convertToMilliseconds(args.min_time, args.unit),
					this.convertToMilliseconds(args.max_time, args.unit),
					args.default_value === "true",
				),
			);

		this.homey.flow
			.getConditionCard("event_never_happened")
			.registerArgumentAutocompleteListener(
				"event_id",
				this.autocomplete.bind(this),
			)
			.registerRunListener(async (args: EventHappenedArgs) =>
				this.storageManager.eventNeverHappened(this.getEventId(args.event_id)),
			);

		this.homey.flow
			.getConditionCard("event_has_happened")
			.registerArgumentAutocompleteListener(
				"event_id",
				this.autocomplete.bind(this),
			)
			.registerRunListener(async (args: EventHappenedArgs) =>
				this.storageManager.eventHasHappened(this.getEventId(args.event_id)),
			);

		this.homey.flow
			.getConditionCard("events_happened_before")
			.registerArgumentAutocompleteListener(
				"event_id_a",
				this.autocomplete.bind(this),
			)
			.registerArgumentAutocompleteListener(
				"event_id_b",
				this.autocomplete.bind(this),
			)
			.registerRunListener(async (args: EventsHappenedCompareArgs) =>
				this.storageManager.eventAHappenedBeforeEventB(
					this.getEventId(args.event_id_a),
					this.getEventId(args.event_id_b),
					args.default_value === "true",
				),
			);

		this.homey.flow
			.getConditionCard("events_happened_after")
			.registerArgumentAutocompleteListener(
				"event_id_a",
				this.autocomplete.bind(this),
			)
			.registerArgumentAutocompleteListener(
				"event_id_b",
				this.autocomplete.bind(this),
			)
			.registerRunListener(async (args: EventsHappenedCompareArgs) =>
				this.storageManager.eventAHappenedBeforeEventB(
					this.getEventId(args.event_id_b),
					this.getEventId(args.event_id_a),
					args.default_value === "true",
				),
			);

		this.homey.flow
			.getConditionCard("events_happened_equally")
			.registerArgumentAutocompleteListener(
				"event_id_a",
				this.autocomplete.bind(this),
			)
			.registerArgumentAutocompleteListener(
				"event_id_b",
				this.autocomplete.bind(this),
			)
			.registerRunListener(async (args: EventsHappenedEquallyArgs) =>
				this.storageManager.eventsHappenedEqually(
					this.getEventId(args.event_id_a),
					this.getEventId(args.event_id_b),
					this.convertToMilliseconds(args.margin, args.margin_unit),
					args.default_value === "true",
				),
			);
	}

	private async autocomplete(query: string): Promise<AutocompleteResult[]> {
		const trimmedQuery = query.trim();
		const results: AutocompleteResult[] = [];
		const eventIds = this.storageManager.getAllEventIds();

		// Always add the current query as the first option if it's not empty
		if (trimmedQuery) {
			results.push({
				id: trimmedQuery,
				name: trimmedQuery,
				description: this.getEventDescription(trimmedQuery),
			});
		}

		// Add existing events that match the query (but not duplicates)
		const lowerQuery = trimmedQuery.toLowerCase();

		for (const id of eventIds) {
			if (id.toLowerCase().includes(lowerQuery) && id !== trimmedQuery) {
				results.push({
					id: id,
					name: id,
					description: this.getEventDescription(id),
				});
			}
		}

		return results;
	}

	private getEventId(eventId: AutocompleteEventId): string {
		return typeof eventId === "string" ? eventId : eventId.id;
	}

	private convertToMilliseconds(time: number, unit: TimeUnit): number {
		switch (unit) {
			case "seconds":
				return time * 1000;
			case "minutes":
				return time * 60 * 1000;
			case "hours":
				return time * 60 * 60 * 1000;
			case "days":
				return time * 24 * 60 * 60 * 1000;
			default:
				throw new Error(`Unknown time unit: ${unit}`);
		}
	}

	private getEventDescription(eventId: string): string {
		const timestamp = this.storageManager.getEventTimestamp(eventId);

		if (timestamp === null) {
			return this.homey.__("never_happened");
		}

		const diff = Date.now() - timestamp;
		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		const weeks = Math.floor(days / 7);
		const years = Math.floor(days / 365);

		const language = this.homey.i18n.getLanguage();
		const rtf = new Intl.RelativeTimeFormat(language, { numeric: "auto" });

		if (years > 0) {
			return rtf.format(-years, "year");
		}

		if (weeks > 0) {
			return rtf.format(-weeks, "week");
		}

		if (days > 0) {
			return rtf.format(-days, "day");
		}

		if (hours > 0) {
			return rtf.format(-hours, "hour");
		}

		if (minutes > 0) {
			return rtf.format(-minutes, "minute");
		}

		return rtf.format(-seconds, "second");
	}
}
