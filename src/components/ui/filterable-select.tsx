import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SelectOption } from '@/hooks/useSelectWithFilter';

interface FilterableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
}

const FilterableSelect: React.FC<FilterableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  loading = false,
  disabled = false,
  className = "",
  emptyMessage = "Nenhum resultado encontrado."
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Filter options based on search value
  const filteredOptions = useMemo(() => {
    if (!searchValue) return options;
    
    const searchLower = searchValue.toLowerCase();
    return options.filter(option => 
      option.name.toLowerCase().includes(searchLower) ||
      option.cpf.toLowerCase().includes(searchLower) ||
      option.label.toLowerCase().includes(searchLower)
    );
  }, [options, searchValue]);

  // Find selected option
  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (currentValue: string) => {
    onChange(currentValue === value ? "" : currentValue);
    setOpen(false);
    setSearchValue("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled || loading}
        >
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando...
            </div>
          ) : selectedOption ? (
            selectedOption.label
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{option.name}</span>
                    <span className="text-sm text-gray-500">{option.cpf}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default FilterableSelect;
