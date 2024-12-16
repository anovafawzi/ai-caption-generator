import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface HolidaySelectProps {
  onSelect: (holiday: string) => void;
}

export function HolidaySelect({ onSelect }: HolidaySelectProps) {
  const holidays = [
    "Christmas",
    "Easter",
    "Halloween",
    "Thanksgiving",
    "New Year",
    "Valentine's Day",
    "Mother's Day",
    "Father's Day",
    "Birthday",
    "Back to School",
    "Summer Fun",
    "Winter Play",
  ]

  return (
    <div className="w-full">
      <Select onValueChange={onSelect}>
        <SelectTrigger className="w-full bg-gray-900 text-gray-200 border-gray-700">
          <SelectValue placeholder="Select a holiday theme" />
        </SelectTrigger>
        <SelectContent className="!bg-[#1f2937] border-gray-700">
          {holidays.map((holiday) => (
            <SelectItem
              key={holiday}
              value={holiday}
              className="text-gray-200 hover:bg-gray-700 hover:text-white cursor-pointer !bg-[#1f2937]"
            >
              {holiday}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
