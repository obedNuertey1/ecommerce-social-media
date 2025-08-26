import React, { useRef } from "react";
import { AsYouType } from "libphonenumber-js";

/**
 * PhoneInputIntl
 * - Uses AsYouType to format international numbers as the user types.
 * - Preserves caret position by counting digits before cursor and mapping to formatted output.
 *
 * Props:
 * - value (string) -> formatted value
 * - onChange(formattedString)
 * - placeholder, className, ...rest
 */
export default function PhoneInputIntl({
    value,
    onChange,
    placeholder = "Enter phone (e.g., +233 24 123 4567)",
    className = "",
    ...rest
}) {
    const inputRef = useRef(null);

    // Count digits (0-9) in a string
    const countDigits = (str) => (str.match(/\d/g) || []).length;

    // Put caret after the Nth digit in the formatted string
    const setCaretAfterDigits = (formattedNew, digitsBeforeCursor) => {
        if (!inputRef.current) return;
        let seen = 0;
        let pos = 0;
        for (; pos < formattedNew.length; pos++) {
            if (/\d/.test(formattedNew[pos])) seen++;
            if (seen >= digitsBeforeCursor) {
                pos++; // place caret after this digit
                break;
            }
        }
        if (digitsBeforeCursor === 0) pos = 0;
        if (pos > formattedNew.length) pos = formattedNew.length;
        setTimeout(() => {
            try {
                inputRef.current.setSelectionRange(pos, pos);
            } catch (e) { }
        }, 0);
    };

    const handleChange = (e) => {
        const raw = e.target.value;
        const selStart = e.target.selectionStart || 0;

        // digits before cursor in old input
        const digitsBeforeCursor = countDigits(raw.slice(0, selStart));

        // use AsYouType to format intelligently (it detects country when + is present)
        const formatter = new AsYouType(); // no default country so international input works
        const formatted = formatter.input(raw);

        // notify parent with formatted
        onChange(formatted);

        // set caret after same count of digits
        setCaretAfterDigits(formatted, digitsBeforeCursor);
    };

    return (
        <input
            ref={inputRef}
            type="tel"
            value={value || ""}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            {...rest}
        />
    );
}
