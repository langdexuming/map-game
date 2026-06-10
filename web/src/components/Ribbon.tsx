interface Props {
  src: string;
  title: string;
  className?: string;
  textTone?: 'dark' | 'light';
}

/**
 * 弹窗标题丝带。
 * - 图来自 vertex 生成的 ribbon PNG（仅装饰，无文字）
 * - 标题文字由 HTML 居中叠加，i18n 友好
 * - 调用方负责外层定位（exposed 外挂或 inset 内嵌）
 */
export function Ribbon({src, title, className = '', textTone = 'dark'}: Props) {
  const textColor = textTone === 'dark' ? 'text-stone-900' : 'text-amber-50';
  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt=""
        aria-hidden
        className="w-full h-auto select-none block"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <span
        className={`absolute inset-0 flex items-center justify-center text-sm font-black tracking-wide whitespace-nowrap px-6 ${textColor} drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]`}
      >
        {title}
      </span>
    </div>
  );
}
