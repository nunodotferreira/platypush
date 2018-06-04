import datetime
import dateutil.parser
import requests
import pytz

from icalendar import Calendar, Event

from platypush.message.response import Response
from platypush.plugins import Plugin
from platypush.plugins.calendar import CalendarInterface


class IcalCalendarPlugin(Plugin, CalendarInterface):
    def __init__(self, url, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = url


    def _translate_event(self, event):
        return {
            'id': str(event.get('uid')) if event.get('uid') else None,
            'kind': 'calendar#event',
            'summary': str(event.get('summary')) if event.get('summary') else None,
            'description': str(event.get('description')) if event.get('description') else None,
            'status': str(event.get('status')).lower() if event.get('status') else None,
            'responseStatus': str(event.get('partstat')).lower() if event.get('partstat') else None,
            'location': str(event.get('location')) if event.get('location') else None,
            'htmlLink': str(event.get('url')) if event.get('url') else None,
            'organizer': {
                'email': str(event.get('organizer')).replace('MAILTO:', ''),
                'displayName': event.get('organizer').params['cn']
            } if event.get('organizer') else None,

            'created': event.get('created').dt.isoformat() if event.get('created') else None,
            'updated': event.get('last-modified').dt.isoformat() if event.get('last-modified') else None,
            'start': {
                'dateTime': event.get('dtstart').dt.isoformat() if event.get('dtstart') else None,
                'timeZone': 'UTC',  # TODO Support multiple timezone IDs
            },

            'end': {
                'dateTime': event.get('dtend').dt.isoformat() if event.get('dtend') else None,
                'timeZone': 'UTC',
            },
        }


    def get_upcoming_events(self, max_results=10, only_participating=True):
        events = []
        response = requests.get(self.url)

        if response.ok:
            calendar = Calendar.from_ical(response.text)
            for event in calendar.walk():
                if event.name != 'VEVENT':
                    continue  # Not an event

                event = self._translate_event(event)

                if event['status'] and event['responseStatus'] \
                        and dateutil.parser.parse(event['end']['dateTime']) >= \
                            datetime.datetime.now(pytz.timezone('UTC')) \
                        and (
                            (only_participating
                             and event['status'] == 'confirmed'
                             and event['responseStatus'] in ['accepted', 'tentative'])
                            or not only_participating):
                    events.append(event)
        else:
            logging.error("HTTP error while getting {}: {}".format(self.url, response))

        return Response(output=events)


# vim:sw=4:ts=4:et:
