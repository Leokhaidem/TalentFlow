// export function Timeline({ events }) {
//   if (!events.length) {
//     return <p className="text-muted-foreground">No timeline available</p>;
//   }

//   return (
//     <div className="border-l-2 border-gray-200 pl-4 space-y-6">
//       {events.map((event, idx) => (
//         <TimelineItem key={idx} event={event} />
//       ))}
//     </div>
//   );
// }

// export function TimelineItem({ event }) {
//   return (
//     <div className="relative">
//       {/* Dot */}
//       <span className="absolute -left-[11px] w-3 h-3 rounded-full bg-blue-500"></span>
//       <div>
//         <p className="font-medium">{event.stage}</p>
//         <p className="text-sm text-muted-foreground">{event.date}</p>
//       </div>
//     </div>
//   );
// }
