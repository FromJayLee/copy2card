interface CreditDisplayProps {
  credits: number | null;
}

export default function CreditDisplay({ credits }: CreditDisplayProps) {
  return (
    <div className="rounded-full border border-black px-4 py-1 text-sm font-medium">
      Credits: {credits ?? "--"}
    </div>
  );
}
