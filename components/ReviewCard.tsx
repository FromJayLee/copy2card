interface ReviewCardProps {
  text: string;
  includeWatermark?: boolean;
}

export default function ReviewCard({ text, includeWatermark = true }: ReviewCardProps) {
  return (
    <div
      id="review-card"
      className="flex h-64 w-full max-w-xl flex-col justify-between rounded-3xl border border-black bg-white p-8 text-left shadow-none"
    >
      <p className="text-lg leading-relaxed text-gray-900">{text || "Paste customer praise here."}</p>
      <div className="mt-8 flex items-center justify-between text-sm text-gray-500">
        <span>copy2card</span>
        {includeWatermark && <span className="text-xs uppercase tracking-wide text-gray-400">Made with copy2card</span>}
      </div>
    </div>
  );
}
