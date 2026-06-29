import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { listServicesCatalog, addServiceToCatalog } from "@/lib/services.functions";

export function ServiceMultiSelect({
  value,
  onChange,
  placeholder = "Select or add services…",
  ariaLabel,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const qc = useQueryClient();

  const list = useServerFn(listServicesCatalog);
  const add = useServerFn(addServiceToCatalog);

  const { data: catalog = [] } = useQuery({
    queryKey: ["services_catalog"],
    queryFn: () => list(),
    staleTime: 60_000,
  });

  const addMutation = useMutation({
    mutationFn: (name: string) => add({ data: { name } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["services_catalog"] });
      toast.success(`Added "${r.name}" to the catalogue`);
    },
    onError: (e: Error) => toast.error(e.message || "Couldn't save new service"),
  });

  const options = useMemo(() => {
    const all = Array.from(new Set([...catalog, ...value])).sort((a, b) => a.localeCompare(b));
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter((s) => s.toLowerCase().includes(q));
  }, [catalog, value, query]);

  const trimmed = query.trim();
  const canCreate =
    trimmed.length >= 2 &&
    !catalog.some((s) => s.toLowerCase() === trimmed.toLowerCase()) &&
    !value.some((s) => s.toLowerCase() === trimmed.toLowerCase());

  function toggle(name: string) {
    onChange(value.includes(name) ? value.filter((s) => s !== name) : [...value, name]);
  }

  async function createNew() {
    if (!canCreate) return;
    onChange([...value, trimmed]);
    setQuery("");
    addMutation.mutate(trimmed);
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-label={ariaLabel ?? placeholder}
            className="w-full justify-between font-normal"
          >
            <span className="truncate text-muted-foreground">
              {value.length === 0 ? placeholder : `${value.length} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search services…"
            />
            <CommandList>
              <CommandEmpty>
                {canCreate ? "Press Enter or click below to create" : "No services found"}
              </CommandEmpty>
              {options.length > 0 && (
                <CommandGroup heading="Services">
                  {options.map((name) => {
                    const selected = value.includes(name);
                    return (
                      <CommandItem
                        key={name}
                        value={name}
                        onSelect={() => toggle(name)}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                        {name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
              {canCreate && (
                <CommandGroup heading="New">
                  <CommandItem onSelect={createNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{trimmed}"
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((s) => (
            <Badge key={s} variant="secondary" className="gap-1 pr-1">
              {s}
              <button
                type="button"
                aria-label={`Remove ${s}`}
                onClick={() => toggle(s)}
                className="ml-0.5 grid h-4 w-4 place-items-center rounded-sm hover:bg-foreground/10"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
