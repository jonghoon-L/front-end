export const NOTICE_BOX_CLASS =
  "bg-gray-50 border border-gray-200 text-gray-600 p-5 rounded-lg text-center font-medium leading-relaxed break-keep";

type ClosedNoticeProps = {
  lines: readonly string[];
};

export default function ClosedNotice({ lines }: ClosedNoticeProps) {
  return (
    <div role="alert" className={NOTICE_BOX_CLASS}>
      <div className="space-y-2">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}
