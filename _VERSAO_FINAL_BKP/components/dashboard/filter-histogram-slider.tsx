"use client"

import * as React from "react"
import { useMemo } from "react"
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts"
import { Slider } from "@/components/ui/slider"

interface FilterHistogramSliderProps {
  data: number[] // array of valor_acao
  min: number
  max: number
  step: number
  value: [number, number]
  onValueChange: (value: [number, number]) => void
}

export function FilterHistogramSlider({
  data,
  min,
  max,
  step,
  value,
  onValueChange
}: FilterHistogramSliderProps) {
  // Compute histogram bins
  const BINS = 40
  const binSize = (max - min) / BINS

  const histogramData = useMemo(() => {
    // Initialize bins
    const bins = Array.from({ length: BINS }, (_, i) => ({
      binStart: min + i * binSize,
      binEnd: min + (i + 1) * binSize,
      count: 0
    }))

    // Fill bins
    data.forEach(val => {
      // Ignore nulls/undefined/NaNs
      if (typeof val !== 'number' || isNaN(val)) return

      if (val < min) {
        bins[0].count++
      } else if (val >= max) {
        bins[BINS - 1].count++
      } else {
        const binIndex = Math.floor((val - min) / binSize)
        // Ensure index is within bounds
        const safeIndex = Math.max(0, Math.min(binIndex, BINS - 1))
        bins[safeIndex].count++
      }
    })

    return bins
  }, [data, min, max, binSize])

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    }).format(val)
  }

  // To prevent the slider from collapsing if the thumbs overlap in UI, we can enforce a minimum distance (e.g. 1 step)
  // Actually Radix does this mostly, but we can manage here if we want.

  return (
    <div className="space-y-4 px-1">
      <div className="relative h-24 mt-2">
        {/* Histogram */}
        <div className="absolute inset-x-0 bottom-4 top-0 pt-4 px-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {histogramData.map((entry, index) => {
                  const isSelected = entry.binEnd >= value[0] && entry.binStart <= value[1]
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isSelected ? "#F6D000" : "#e2e8f0"} 
                      className="transition-colors duration-200"
                    />
                  )
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Slider positioned over the bottom edge of the histogram */}
        <div className="absolute inset-x-0 bottom-0">
          <Slider
            min={min}
            max={max}
            step={step}
            value={value}
            onValueChange={(val) => onValueChange(val as [number, number])}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Values Display */}
      <div className="flex items-center justify-between mt-6 pt-2">
          <div className="bg-white border rounded-full px-4 py-1.5 flex flex-col items-center shadow-sm w-[130px]">
             <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Mínimo</span>
             <span className="text-[13px] font-semibold text-slate-800">{formatCurrency(value[0])}</span>
          </div>
          <div className="bg-white border rounded-full px-4 py-1.5 flex flex-col items-center shadow-sm w-[130px]">
             <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Máximo</span>
             <span className="text-[13px] font-semibold text-slate-800">{value[1] >= max ? `${formatCurrency(max)}+` : formatCurrency(value[1])}</span>
          </div>
      </div>
    </div>
  )
}
