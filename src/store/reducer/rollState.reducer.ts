import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RolllStateType } from "shared/models/roll";
import { AppThunk } from "store";

interface RollState {
  rollStateMap: {
    [studentId: number]: RolllStateType;
  };
}

const initialState: RollState = {
  rollStateMap: {},
};
export const rollStateSlice = createSlice({
  name: "rollState",
  initialState: initialState,
  reducers: {
    changeStudentRollstate: (
      state,
      action: PayloadAction<{ studentID: number; rollState: RolllStateType }>
    ) => {
      state.rollStateMap[action.payload.studentID] = action.payload.rollState;
    },
  },
});

export const { changeStudentRollstate } = rollStateSlice.actions;

export default rollStateSlice.reducer;
