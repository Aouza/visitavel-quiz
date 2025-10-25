"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar } from "lucide-react";

interface DateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  maxDate?: string;
  minDate?: string;
  label?: string;
  required?: boolean;
}

export function DateSelector({
  value,
  onChange,
  maxDate,
  minDate,
  label = "Selecione sua data",
  required = false,
}: DateSelectorProps) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (!value || value.trim() === "") {
      setDay("");
      setMonth("");
      setYear("");
      return;
    }

    const [yearPart, monthPart, dayPart] = value.split("-");
    setYear(yearPart ?? "");
    setMonth(monthPart ?? "");
    setDay(dayPart ?? "");
  }, [value]);

  // Função para construir data válida
  const buildValidDate = useCallback((d: string, m: string, y: string) => {
    if (!d || !m || !y) return "";

    const dayNum = parseInt(d);
    const monthNum = parseInt(m);
    const yearNum = parseInt(y);

    // Validações básicas
    if (dayNum < 1 || dayNum > 31) return "";
    if (monthNum < 1 || monthNum > 12) return "";
    if (yearNum < 1900 || yearNum > new Date().getFullYear()) return "";

    // Validação de dias por mês
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const isLeapYear =
      (yearNum % 4 === 0 && yearNum % 100 !== 0) || yearNum % 400 === 0;
    const maxDays =
      monthNum === 2 && isLeapYear ? 29 : daysInMonth[monthNum - 1];

    if (dayNum > maxDays) return "";

    return `${y}-${m}-${d}`;
  }, []);

  // Handlers que atualizam estado e notificam mudança
  const handleDayChange = useCallback(
    (newDay: string) => {
      setDay(newDay);
      const dateStr = buildValidDate(newDay, month, year);
      onChange(dateStr);
    },
    [month, year, buildValidDate, onChange]
  );

  const handleMonthChange = useCallback(
    (newMonth: string) => {
      setMonth(newMonth);
      const dateStr = buildValidDate(day, newMonth, year);
      onChange(dateStr);
    },
    [day, year, buildValidDate, onChange]
  );

  const handleYearChange = useCallback(
    (newYear: string) => {
      setYear(newYear);
      const dateStr = buildValidDate(day, month, newYear);
      onChange(dateStr);
    },
    [day, month, buildValidDate, onChange]
  );

  // Gerar arrays para dropdowns
  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  const months = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  const minYear = minDate ? parseInt(minDate.split("-")[0]) : 1900;
  const maxYear = maxDate
    ? parseInt(maxDate.split("-")[0])
    : new Date().getFullYear();
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) =>
    (maxYear - i).toString()
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-slate-600">
        <Calendar className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>

      {/* Grid de selects */}
      <div className="grid grid-cols-3 gap-3">
        {/* Dia */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600 block">
            Dia
          </label>
          <select
            value={day}
            onChange={(e) => handleDayChange(e.target.value)}
            aria-required={required}
            className="w-full h-12 px-3 rounded-xl border border-slate-300 bg-white text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors"
          >
            <option value="">Dia</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Mês */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600 block">
            Mês
          </label>
          <select
            value={month}
            onChange={(e) => handleMonthChange(e.target.value)}
            aria-required={required}
            className="w-full h-12 px-3 rounded-xl border border-slate-300 bg-white text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors"
          >
            <option value="">Mês</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ano */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600 block">
            Ano
          </label>
          <select
            value={year}
            onChange={(e) => handleYearChange(e.target.value)}
            aria-required={required}
            className="w-full h-12 px-3 rounded-xl border border-slate-300 bg-white text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors"
          >
            <option value="">Ano</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
