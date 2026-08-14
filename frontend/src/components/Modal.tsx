import { ReactNode } from "react";

type ModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, isOpen, onClose, children }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#202136]/75 p-4 backdrop-blur-sm">
      <section className="max-h-[92dvh] w-full max-w-xl overflow-hidden border border-[#9ac9d6]/25 bg-[#2a2b43] shadow-[0_28px_90px_rgba(10,12,28,0.58)]">
        <div className="border-b border-[#9ac9d6]/20 bg-[#33334b] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="mt-1 text-xl font-semibold text-strong">{title}</h2>
            </div>
            <button className="btn-quiet px-3 py-1" onClick={onClose} type="button">
              Fechar
            </button>
          </div>
        </div>

        <div className="max-h-[calc(92dvh-88px)] overflow-y-auto p-5">{children}</div>
      </section>
    </div>
  );
}
