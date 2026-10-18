import { HistoryTimeline, type TimelineEvent } from 'm2timeline-motion';
import 'm2timeline-motion/styles.css';

const history: TimelineEvent[] = [
  { id: 'sputnik', title: 'Sputnik 1', date: '1957-10-04', group: 'The Space Race', description: 'The first artificial satellite.' },
  { id: 'apollo', title: 'Apollo 11 lands on the Moon', date: '1969-07-20', group: 'The Space Race', highlight: true },
  {
    id: 'hubble',
    title: 'Hubble Space Telescope',
    date: '1990-04-24',
    group: 'Orbital era',
    image: { src: '/hubble.jpg', alt: 'Hubble in orbit' },
  },
];

export function History() {
  return <HistoryTimeline events={history} appearance="editorial" jumpTo />;
}
