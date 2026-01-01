export const mapKeyboardEventToElectronKey = (e: React.KeyboardEvent | KeyboardEvent): string | null => {
    // Prevent mapping modifier keys alone
    if (['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) return null;

    const key = e.key;

    // Map Special Keys
    const specialKeys: Record<string, string> = {
        'ArrowUp': 'Up',
        'ArrowDown': 'Down',
        'ArrowLeft': 'Left',
        'ArrowRight': 'Right',
        'Enter': 'Enter',
        'Escape': 'Esc',
        'Backspace': 'Backspace',
        'Delete': 'Delete',
        'Tab': 'Tab',
        ' ': 'Space',
        // F-keys usually map directly but let's be safe
        'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4', 'F5': 'F5',
        'F6': 'F6', 'F7': 'F7', 'F8': 'F8', 'F9': 'F9', 'F10': 'F10',
        'F11': 'F11', 'F12': 'F12',
    };

    if (specialKeys[key]) {
        return specialKeys[key];
    }

    // Standard Character Keys (A-Z, 0-9)
    if (key.length === 1) {
        return key.toUpperCase();
    }

    return null;
};
