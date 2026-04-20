import { Check, ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CURRENCIES, getCurrency } from "@/lib/currencies";

interface CurrencySelectProps {
  value: string;
  onChange: (code: string) => void;
  exclude?: string;
  align?: "start" | "end";
}

export const CurrencySelect = ({ value, onChange, exclude, align = "start" }: CurrencySelectProps) => {
  const [open, setOpen] = useState(false);
  const current = getCurrency(value);

  const list = useMemo(
    () => CURRENCIES.filter((c) => c.code !== exclude),
    [exclude]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="h-auto gap-2 rounded-full bg-secondary/60 px-3 py-2 hover:bg-secondary"
        >
          <span className="text-2xl leading-none" aria-hidden>
            {current.flag}
          </span>
          <span className="font-display text-sm font-semibold tracking-wide">
            {current.code}
          </span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-72 border-border/60 bg-popover/95 p-0 backdrop-blur-xl"
      >
        <Command className="bg-transparent">
          <div className="flex items-center gap-2 border-b border-border/60 px-3">
            <Search className="h-4 w-4 opacity-50" />
            <CommandInput
              placeholder="Search currencies..."
              className="h-11 border-0 focus:ring-0"
            />
          </div>
          <CommandList className="max-h-72">
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {list.map((c) => (
                <CommandItem
                  key={c.code}
                  value={`${c.code} ${c.name}`}
                  onSelect={() => {
                    onChange(c.code);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xl">{c.flag}</span>
                  <div className="flex flex-1 flex-col">
                    <span className="font-display text-sm font-semibold">{c.code}</span>
                    <span className="text-xs text-muted-foreground">{c.name}</span>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 text-primary transition-opacity",
                      value === c.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
