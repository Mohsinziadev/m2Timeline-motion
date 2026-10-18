import { CircularProgress, ProgressBar, SegmentedProgress, StepProgress, type ProgressSegment } from 'm2timeline-motion';
import 'm2timeline-motion/styles.css';

const sessions: ProgressSegment[] = [
  { status: 'complete', label: 'V Therapy', description: 'Wed, Jan 9' },
  { status: 'complete', label: 'V Therapy', description: 'Wed, Jan 16' },
  { status: 'scheduled', label: 'V Therapy', description: 'Wed, Jan 23' },
  { status: 'pending', label: 'V Therapy', description: 'Wed, Jan 30' },
];

export function ProgressExamples({ onCancel }: { onCancel?: () => void }) {
  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <ProgressBar
        label="Uploading…"
        info="Files upload in the background"
        value={45}
        status="loading"
        helperText="27MB of 60MB"
        onCancel={onCancel}
      />
      <ProgressBar label="Upload Failed" value={100} status="error" valuePosition="none" helperText="Oops, something went wrong" />
      <ProgressBar variant="chevron" value={40} color={['#ec4899', '#f9a8d4']} aria-label="Profile completion" />
      <SegmentedProgress label="Your Progress" segments={sessions} />
      <StepProgress
        steps={[{ label: 'Customer' }, { label: 'Shipping' }, { label: 'Payment' }, { label: 'Confirm' }]}
        current={1}
        tone="success"
        pointer
      />
      <CircularProgress value={70} variant="gauge" sublabel="Grade Rating" color="#9b6cf6" />
    </div>
  );
}
