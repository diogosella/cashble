import { Account } from "../types";
import { formatMoney } from "../utils/money";

type AccountTabsProps = {
  accounts: Account[];
  activeAccountId: string;
  areValuesVisible: boolean;
  onSelectAccount: (accountId: string) => void;
};

export function AccountTabs({ accounts, activeAccountId, areValuesVisible, onSelectAccount }: AccountTabsProps) {
  return (
    <nav className="surface overflow-x-auto p-2">
      <div className="flex min-w-max gap-2">
        {accounts.map((account) => {
          const isActive = account.id === activeAccountId;

          return (
            <button
              className={
                isActive
                  ? "bg-[#8493b3] px-4 py-3 text-left font-semibold text-[#202136] shadow-[0_12px_30px_rgba(132,147,179,0.18)]"
                  : "border border-transparent px-4 py-3 text-left text-muted hover:border-[#9ac9d6]/30 hover:bg-[#30324c]"
              }
              key={account.id}
              onClick={() => onSelectAccount(account.id)}
              type="button"
            >
              <span className="block text-sm font-semibold">{account.name}</span>
              <span className={isActive ? "block text-xs text-[#202136]/75" : "block text-xs text-muted"}>
                {areValuesVisible ? formatMoney(account.balance) : "******"}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
