/*
 * This page essentially just functions as a wrapped for the club Google Calendar.
 *
 * @author Colin Hermack
 */

export const metadata = {
  title: "Calendar",
  description: "Calendar of events from the Purdue Outing Club.",
};

export default function CalendarPage() {
  return (
    <div className="flex flex-col justify-top items-center">
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        Calendar
      </h1>
      <div className="flex justify-center items-center mt-10 w-10/12 md:w-screen">
        <iframe
          className="rounded-medium"
          height="700"
          src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FNew_York&showPrint=0&src=cHVyZHVlb3V0aW5nQGdtYWlsLmNvbQ&src=YWJwaW04a2JvNHBjc3RsdGk0dGQxZXRsazhAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&src=YXJuOGpnb25waXBwNjI1ZTIxdWIyZG1pZW9AZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&src=Y2xhc3Nyb29tMTEwMzAxNzMwMzM2NTAyNDkzNDY2QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23F6BF26&color=%23F6BF26&color=%23009688&color=%23F09300"
          title="calendar"
          width="1000"
        />
      </div>
    </div>
  );
}
