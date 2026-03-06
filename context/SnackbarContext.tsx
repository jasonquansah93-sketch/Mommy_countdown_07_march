import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SnackbarState {
  message: string;
  onUndo?: () => void;
}

interface SnackbarContextType {
  showSnackbar: (message: string, onUndo?: () => void) => void;
  hideSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType>({
  showSnackbar: () => {},
  hideSnackbar: () => {},
});

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  const showSnackbar = useCallback((message: string, onUndo?: () => void) => {
    setSnackbar({ message, onUndo });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar(null);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}
      {snackbar && (
        <View style={styles.snackbar}>
          <Text style={styles.message}>{snackbar.message}</Text>
          {snackbar.onUndo && (
            <TouchableOpacity
              onPress={() => {
                snackbar.onUndo?.();
                hideSnackbar();
              }}
              style={styles.undoBtn}
            >
              <Text style={styles.undoText}>Undo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  return useContext(SnackbarContext);
}

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  message: { color: '#FFF', fontSize: 15 },
  undoBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  undoText: { color: '#4FC3F7', fontSize: 15, fontWeight: '600' },
});
