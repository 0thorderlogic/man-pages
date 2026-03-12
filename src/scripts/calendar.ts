import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CALENDAR_IDS } from "../lib/calendar/constants";
import {
  dayKeyFromDate,
  dayKeyFromIso,
  formatDayNumber,
  formatMonthYear,
  formatReadableDay,
  formatTimeFromIso,
} from "../lib/calendar/date";
import type { CalendarEvent } from "../lib/calendar/types";

interface CalendarDomRefs {
  container: HTMLElement;
  prevMonthButton: HTMLButtonElement;
  nextMonthButton: HTMLButtonElement;
  monthHeader: HTMLElement;
  grid: HTMLElement;
  modal: HTMLElement;
  closeModalButton: HTMLButtonElement;
  modalTitle: HTMLElement;
  modalEvents: HTMLElement;
  noEventsMessage: HTMLElement;
}

function getById<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function getCalendarDomRefs(): CalendarDomRefs | null {
  const container = getById<HTMLElement>(CALENDAR_IDS.container);
  const prevMonthButton = getById<HTMLButtonElement>(CALENDAR_IDS.prevMonthButton);
  const nextMonthButton = getById<HTMLButtonElement>(CALENDAR_IDS.nextMonthButton);
  const monthHeader = getById<HTMLElement>(CALENDAR_IDS.monthHeader);
  const grid = getById<HTMLElement>(CALENDAR_IDS.grid);
  const modal = getById<HTMLElement>(CALENDAR_IDS.modal);
  const closeModalButton = getById<HTMLButtonElement>(CALENDAR_IDS.closeModalButton);
  const modalTitle = getById<HTMLElement>(CALENDAR_IDS.modalTitle);
  const modalEvents = getById<HTMLElement>(CALENDAR_IDS.modalEvents);
  const noEventsMessage = getById<HTMLElement>(CALENDAR_IDS.noEventsMessage);

  if (
    !container ||
    !prevMonthButton ||
    !nextMonthButton ||
    !monthHeader ||
    !grid ||
    !modal ||
    !closeModalButton ||
    !modalTitle ||
    !modalEvents ||
    !noEventsMessage
  ) {
    return null;
  }

  return {
    container,
    prevMonthButton,
    nextMonthButton,
    monthHeader,
    grid,
    modal,
    closeModalButton,
    modalTitle,
    modalEvents,
    noEventsMessage,
  };
}

function showModal(modal: HTMLElement): void {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function hideModal(modal: HTMLElement): void {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function createTextElement(
  tagName: keyof HTMLElementTagNameMap,
  className: string,
  text: string,
): HTMLElement {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function createEventCard(event: CalendarEvent): HTMLElement {
  const card = document.createElement("div");
  card.className = "flex flex-col p-4 rounded bg-gruv-bg border border-gruv-gray/20 shadow-sm";

  card.appendChild(createTextElement("div", "font-bold text-gruv-fg mb-1 text-lg", event.title));

  const timeText = event.isAllDay
    ? "All Day"
    : event.end
      ? `${formatTimeFromIso(event.start)} - ${formatTimeFromIso(event.end)}`
      : formatTimeFromIso(event.start);
  card.appendChild(createTextElement("div", "text-sm text-gruv-green font-bold mb-2", timeText));

  if (event.location) {
    const location = document.createElement("div");
    location.className = "text-sm text-gruv-yellow mt-1 flex items-start gap-1.5";
    location.appendChild(createTextElement("span", "opacity-80", "📍"));
    location.appendChild(document.createTextNode(event.location));
    card.appendChild(location);
  }

  if (event.hangoutLink) {
    const meetWrapper = document.createElement("div");
    meetWrapper.className = "mt-2";

    const meetLink = document.createElement("a");
    meetLink.href = event.hangoutLink;
    meetLink.target = "_blank";
    meetLink.rel = "noopener noreferrer";
    meetLink.className = "text-sm text-gruv-aqua flex items-center gap-1.5 hover:underline w-fit";

    meetLink.appendChild(createTextElement("span", "opacity-80", "🎥"));
    meetLink.appendChild(document.createTextNode("Join Google Meet"));
    meetWrapper.appendChild(meetLink);
    card.appendChild(meetWrapper);
  }

  if (event.attendeesCount > 0) {
    const attendees = document.createElement("div");
    attendees.className = "text-xs text-gruv-gray mt-2 flex items-center gap-1.5";
    attendees.appendChild(createTextElement("span", "opacity-80", "👥"));
    attendees.appendChild(document.createTextNode(`${event.attendeesCount} attendee(s)`));
    card.appendChild(attendees);
  }

  if (event.description) {
    card.appendChild(
      createTextElement(
        "div",
        "text-sm text-gruv-fg/80 mt-3 p-3 bg-gruv-bg0-s rounded max-h-32 overflow-y-auto hide-scrollbar break-words whitespace-pre-wrap",
        event.description,
      ),
    );
  }

  const linkContainer = document.createElement("div");
  linkContainer.className = "mt-4 pt-3 border-t border-gruv-gray/20 flex justify-end";

  const viewLink = document.createElement("a");
  viewLink.href = event.link;
  viewLink.target = "_blank";
  viewLink.rel = "noopener noreferrer";
  viewLink.className =
    "text-xs font-mono text-gruv-blue-light hover:text-gruv-blue hover:underline";
  viewLink.textContent = "View in Calendar";

  linkContainer.appendChild(viewLink);
  card.appendChild(linkContainer);

  return card;
}

function renderDayModal(day: Date, events: CalendarEvent[], refs: CalendarDomRefs): void {
  refs.modalTitle.textContent = formatReadableDay(day);
  refs.modalEvents.innerHTML = "";

  if (events.length === 0) {
    refs.noEventsMessage.classList.remove("hidden");
    refs.modalEvents.classList.add("hidden");
  } else {
    refs.noEventsMessage.classList.add("hidden");
    refs.modalEvents.classList.remove("hidden");
    events.forEach((event) => {
      refs.modalEvents.appendChild(createEventCard(event));
    });
  }

  showModal(refs.modal);
}

function buildEventsByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>();

  events.forEach((event) => {
    const dayKey = dayKeyFromIso(event.start);
    if (!dayKey) return;

    const dayEvents = grouped.get(dayKey) ?? [];
    dayEvents.push(event);
    grouped.set(dayKey, dayEvents);
  });

  return grouped;
}

function createDayCell(
  day: Date,
  monthStart: Date,
  dayEvents: CalendarEvent[],
  refs: CalendarDomRefs,
): HTMLElement {
  const dayElement = document.createElement("div");
  const inCurrentMonth = isSameMonth(day, monthStart);
  const isToday = isSameDay(day, new Date());

  dayElement.className = `min-h-[80px] md:min-h-[100px] p-1 md:p-2 border rounded flex flex-col transition-colors cursor-pointer ${
    inCurrentMonth ? "bg-gruv-bg border-gruv-bg0-s" : "bg-transparent border-gruv-bg opacity-40"
  } ${isToday ? "border-gruv-yellow bg-gruv-bg0-s/50" : ""} hover:border-gruv-gray hover:bg-gruv-bg0-s`;

  const dateNumber = document.createElement("div");
  dateNumber.className = `text-right text-sm md:text-base font-bold ${
    inCurrentMonth ? "text-gruv-fg" : "text-gruv-gray-light"
  } ${isToday ? "text-gruv-yellow-light" : ""}`;
  dateNumber.textContent = formatDayNumber(day);
  dayElement.appendChild(dateNumber);

  const eventsContainer = document.createElement("div");
  eventsContainer.className = "flex-1 overflow-y-auto mt-1 flex flex-col gap-1 hide-scrollbar";

  dayEvents.forEach((event) => {
    const chip = document.createElement("div");
    chip.title = event.title;
    chip.className = `text-xs px-1 py-0.5 rounded truncate block ${
      event.isAllDay
        ? "bg-gruv-aqua text-gruv-bg"
        : "bg-gruv-bg0-s text-gruv-blue-light border border-gruv-blue/30"
    }`;

    if (event.isAllDay) {
      chip.textContent = event.title;
    } else {
      chip.textContent = `${formatTimeFromIso(event.start)} ${event.title}`;
    }

    eventsContainer.appendChild(chip);
  });

  dayElement.appendChild(eventsContainer);
  dayElement.addEventListener("click", () => {
    renderDayModal(day, dayEvents, refs);
  });

  return dayElement;
}

function renderCalendar(
  currentDate: Date,
  eventsByDay: Map<string, CalendarEvent[]>,
  refs: CalendarDomRefs,
): void {
  refs.monthHeader.textContent = formatMonthYear(currentDate);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const intervalStart = startOfWeek(monthStart);
  const intervalEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: intervalStart, end: intervalEnd });

  refs.grid.innerHTML = "";

  days.forEach((day) => {
    const dayEvents = eventsByDay.get(dayKeyFromDate(day)) ?? [];
    refs.grid.appendChild(createDayCell(day, monthStart, dayEvents, refs));
  });
}

function isCalendarEvent(value: unknown): value is CalendarEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Record<string, unknown>;

  return (
    typeof event.id === "string" &&
    typeof event.title === "string" &&
    typeof event.start === "string" &&
    typeof event.link === "string" &&
    typeof event.isAllDay === "boolean"
  );
}

function parseCalendarEventsPayload(payload: unknown): CalendarEvent[] {
  if (!Array.isArray(payload)) return [];
  return payload.filter(isCalendarEvent);
}

function readEventsFromJsonScript(scriptId: string): CalendarEvent[] {
  const script = document.getElementById(scriptId);
  if (!script?.textContent) return [];

  try {
    return parseCalendarEventsPayload(JSON.parse(script.textContent));
  } catch {
    return [];
  }
}

function setupModalEvents(refs: CalendarDomRefs): void {
  refs.closeModalButton.addEventListener("click", () => {
    hideModal(refs.modal);
  });

  refs.modal.addEventListener("click", (event) => {
    if (event.target === refs.modal) {
      hideModal(refs.modal);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !refs.modal.classList.contains("hidden")) {
      hideModal(refs.modal);
    }
  });
}

export function initCalendar(events: CalendarEvent[]): void {
  const refs = getCalendarDomRefs();
  if (!refs) return;

  const eventsByDay = buildEventsByDay(events);
  let currentDate = new Date();

  const rerender = () => {
    renderCalendar(currentDate, eventsByDay, refs);
  };

  refs.prevMonthButton.addEventListener("click", () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    rerender();
  });

  refs.nextMonthButton.addEventListener("click", () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    rerender();
  });

  setupModalEvents(refs);
  rerender();
}

export function initCalendarFromDom(scriptId: string): void {
  initCalendar(readEventsFromJsonScript(scriptId));
}
