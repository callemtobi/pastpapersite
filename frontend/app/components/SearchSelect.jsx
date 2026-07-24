// components/SearchSelect.jsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader, ChevronDown, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function SearchSelect({
  id,
  label,
  value,
  onChange,
  placeholder = "Search...",
  fetchOptions,
  initialOptions = [],
  required = false,
  className = "",
  debounceDelay = 300,
  minChars = 1,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState(initialOptions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeout = useRef(null);

  // Find the label for the selected value
  useEffect(() => {
    if (!isUserTyping) {
      if (value && options.length > 0) {
        const selected = options.find((opt) => opt._id === value);
        if (selected) {
          const displayName = getDisplayName(selected);
          setSelectedLabel(displayName);
          setSearchTerm(displayName);
        }
      } else if (!value) {
        setSelectedLabel("");
        if (!isUserTyping) {
          setSearchTerm("");
        }
      }
    }
  }, [value, options, isUserTyping]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsUserTyping(false);
        if (value) {
          const selected = options.find((opt) => opt._id === value);
          if (selected) {
            setSearchTerm(getDisplayName(selected));
          }
        } else {
          setSearchTerm("");
        }
        setError(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, options]);

  // Get display name for an option
  const getDisplayName = (option) => {
    if (option.title && option.name) {
      return `${option.title} ${option.name}`;
    }
    return option.name || "";
  };

  // Debounced search
  const performSearch = useCallback(
    async (term) => {
      if (!term || term.length < minChars) {
        if (term === "") {
          setOptions(initialOptions);
          setError(null);
        } else {
          setOptions([]);
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await fetchOptions(term);
        setOptions(results || []);
        if (results && results.length === 0) {
          setError("No results found");
        }
      } catch (error) {
        console.error("Search error:", error);
        setError(error.message || "Search failed");
      } finally {
        setLoading(false);
      }
    },
    [fetchOptions, initialOptions, minChars],
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setError(null);
    setIsUserTyping(true);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (term === "") {
      setOptions(initialOptions);
      setLoading(false);
      return;
    }

    searchTimeout.current = setTimeout(() => {
      performSearch(term);
    }, debounceDelay);
  };

  // Handle option selection
  const handleSelect = (option) => {
    onChange(option._id);
    const displayName = getDisplayName(option);
    setSelectedLabel(displayName);
    setSearchTerm(displayName);
    setIsOpen(false);
    setError(null);
    setIsUserTyping(false);
  };

  // Handle clearing selection
  const handleClear = () => {
    onChange("");
    setSelectedLabel("");
    setSearchTerm("");
    setOptions(initialOptions);
    setIsOpen(false);
    setError(null);
    setIsUserTyping(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
      setError(null);
      // Select all text on focus for better UX
      if (inputRef.current) {
        inputRef.current.select();
      }
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && !value) {
        setSearchTerm("");
        setOptions(initialOptions);
        setError(null);
        setIsUserTyping(false);
      }
      // Focus the input when opening
      if (!isOpen) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 50);
      }
    }
  };

  return (
    <div className={`space-y-2 ${className}`} ref={wrapperRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Search Input */}
        <div
          className={`relative flex items-center border rounded-lg transition-colors ${
            isOpen
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-border-light hover:border-gray-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"}`}
        >
          <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />

          <input
            ref={inputRef}
            id={`search-input-${id}`}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            onClick={(e) => e.stopPropagation()}
            placeholder={selectedLabel || placeholder}
            className={`w-full pl-9 pr-10 py-2 bg-transparent outline-none text-foreground ${
              disabled ? "cursor-not-allowed" : ""
            }`}
            disabled={disabled}
            autoComplete="off"
          />

          <div className="absolute right-2 flex items-center gap-1">
            {loading && (
              <Loader className="w-4 h-4 animate-spin text-gray-400" />
            )}

            {value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}

            <button
              type="button"
              onClick={toggleDropdown}
              className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              disabled={disabled}
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && !loading && (
          <div className="mt-1 text-sm text-red-500">{error}</div>
        )}

        {/* Dropdown Options */}
        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-border-light rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-gray-500">
                    Searching...
                  </span>
                </div>
              ) : options.length > 0 ? (
                options.map((option) => (
                  <button
                    key={option._id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      value === option._id
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{getDisplayName(option)}</span>
                      {value === option._id && (
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    {option.code && (
                      <span className="text-xs text-gray-500">
                        {option.code}
                      </span>
                    )}
                    {option.department &&
                      typeof option.department === "object" &&
                      option.department.name && (
                        <span className="text-xs text-gray-400 ml-2">
                          {option.department.name}
                        </span>
                      )}
                    {option.department &&
                      typeof option.department === "string" && (
                        <span className="text-xs text-gray-400 ml-2">
                          {option.department}
                        </span>
                      )}
                  </button>
                ))
              ) : searchTerm.length >= minChars ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No results found for &quot;{searchTerm}&quot;
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  Type at least {minChars} character(s) to search
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
