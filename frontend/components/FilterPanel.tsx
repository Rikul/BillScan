import React, { useState, useEffect, useCallback } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Input, Label } from "./UI";

export interface FilterState {
    dateFrom: string;
    dateTo: string;
    storeName: string;
    minAmount: string;
    maxAmount: string;
}

const FILTER_STORAGE_KEY = "billscan_filters";

const defaultFilters: FilterState = {
    dateFrom: "",
    dateTo: "",
    storeName: "",
    minAmount: "",
    maxAmount: "",
};

// Load filters from localStorage
export const loadFiltersFromStorage = (): FilterState => {
    try {
        const stored = localStorage.getItem(FILTER_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return { ...defaultFilters, ...parsed };
        }
    } catch (e) {
        console.error("Failed to load filters from localStorage:", e);
    }
    return defaultFilters;
};

// Save filters to localStorage
const saveFiltersToStorage = (filters: FilterState): void => {
    try {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch (e) {
        console.error("Failed to save filters to localStorage:", e);
    }
};

// Check if any filters are active
export const hasActiveFilters = (filters: FilterState): boolean => {
    return (
        filters.dateFrom !== "" ||
        filters.dateTo !== "" ||
        filters.storeName !== "" ||
        filters.minAmount !== "" ||
        filters.maxAmount !== ""
    );
};

interface FilterPanelProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState | ((prev: FilterState) => FilterState)) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
    const [isExpanded, setIsExpanded] = useState(() => hasActiveFilters(filters));

    // Save filters whenever they change
    useEffect(() => {
        saveFiltersToStorage(filters);
    }, [filters]);

    const handleChange = useCallback((field: keyof FilterState, value: string) => {
        onFiltersChange((prevFilters) => ({
            ...prevFilters,
            [field]: value,
        }));
    }, [onFiltersChange]);

    const handleClearFilters = useCallback(() => {
        onFiltersChange(defaultFilters);
    }, [onFiltersChange]);

    const activeFilterCount = [
        filters.dateFrom,
        filters.dateTo,
        filters.storeName,
        filters.minAmount,
        filters.maxAmount,
    ].filter(Boolean).length;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Filter Header - Always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Filter className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium text-gray-900">Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                            {activeFilterCount} active
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClearFilters();
                            }}
                            className="text-xs text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
                        >
                            <X className="w-3 h-3" />
                            Clear all
                        </button>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Expandable Filter Content */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Date From */}
                        <div>
                            <Label>Date From</Label>
                            <Input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => handleChange("dateFrom", e.target.value)}
                                className="bg-gray-50"
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <Label>Date To</Label>
                            <Input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => handleChange("dateTo", e.target.value)}
                                className="bg-gray-50"
                            />
                        </div>

                        {/* Store Name */}
                        <div>
                            <Label>Store Name</Label>
                            <Input
                                type="text"
                                placeholder="Search store..."
                                value={filters.storeName}
                                onChange={(e) => handleChange("storeName", e.target.value)}
                                className="bg-gray-50"
                            />
                        </div>

                        {/* Min Amount */}
                        <div>
                            <Label>Min Amount</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                value={filters.minAmount}
                                onChange={(e) => handleChange("minAmount", e.target.value)}
                                className="bg-gray-50"
                            />
                        </div>

                        {/* Max Amount */}
                        <div>
                            <Label>Max Amount</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                value={filters.maxAmount}
                                onChange={(e) => handleChange("maxAmount", e.target.value)}
                                className="bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Validation Warnings */}
                    {(filters.dateFrom && filters.dateTo && filters.dateTo < filters.dateFrom) && (
                        <div className="mt-3 text-red-600 text-sm flex items-center gap-2">
                            <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            Warning: "Date To" must be after "Date From"
                        </div>
                    )}
                    {(() => {
                        const minVal = parseFloat(filters.minAmount);
                        const maxVal = parseFloat(filters.maxAmount);
                        return filters.minAmount && filters.maxAmount && !isNaN(minVal) && !isNaN(maxVal) && maxVal < minVal;
                    })() && (
                        <div className="mt-3 text-red-600 text-sm flex items-center gap-2">
                            <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            Warning: "Max Amount" must be greater than or equal to "Min Amount"
                        </div>
                    )}

                    {/* Active Filters Summary */}
                    {activeFilterCount > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                                {filters.dateFrom && (
                                    <FilterTag
                                        label={`From: ${filters.dateFrom}`}
                                        onRemove={() => handleChange("dateFrom", "")}
                                    />
                                )}
                                {filters.dateTo && (
                                    <FilterTag
                                        label={`To: ${filters.dateTo}`}
                                        onRemove={() => handleChange("dateTo", "")}
                                    />
                                )}
                                {filters.storeName && (
                                    <FilterTag
                                        label={`Store: ${filters.storeName}`}
                                        onRemove={() => handleChange("storeName", "")}
                                    />
                                )}
                                {filters.minAmount && (
                                    <FilterTag
                                        label={`Min: $${filters.minAmount}`}
                                        onRemove={() => handleChange("minAmount", "")}
                                    />
                                )}
                                {filters.maxAmount && (
                                    <FilterTag
                                        label={`Max: $${filters.maxAmount}`}
                                        onRemove={() => handleChange("maxAmount", "")}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Filter Tag Component
const FilterTag: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
        {label}
        <button
            onClick={onRemove}
            className="hover:bg-indigo-100 rounded-full p-0.5 transition-colors"
        >
            <X className="w-3 h-3" />
        </button>
    </span>
);

export default FilterPanel;
