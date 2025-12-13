import React, { createContext, useContext, useReducer } from "react";

const MoodStateContext = createContext(null);
const MoodDispatchContext = createContext(null);

const initialState = {
  entries: [],
  loading: false,
  error: null,
  quote: null,
};

function moodReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ENTRIES":
      return { ...state, entries: action.payload, error: null };
    case "ADD_ENTRY":
      return { ...state, entries: [...state.entries, action.payload] };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_QUOTE":
      return { ...state, quote: action.payload };
    default:
      return state;
  }
}

export function MoodProvider({ children }) {
  const [state, dispatch] = useReducer(moodReducer, initialState);

  return (
    <MoodStateContext.Provider value={state}>
      <MoodDispatchContext.Provider value={dispatch}>
        {children}
      </MoodDispatchContext.Provider>
    </MoodStateContext.Provider>
  );
}

export function useMoodState() {
  const ctx = useContext(MoodStateContext);
  if (!ctx) throw new Error("useMoodState must be used within a MoodProvider");
  return ctx;
}

export function useMoodDispatch() {
  const ctx = useContext(MoodDispatchContext);
  if (!ctx)
    throw new Error("useMoodDispatch must be used within a MoodProvider");
  return ctx;
}
