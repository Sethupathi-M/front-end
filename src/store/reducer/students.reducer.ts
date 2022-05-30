import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Person } from "shared/models/person";
import { AppThunk } from "store";

interface StudentMap {
  [studentId: number]: Person;
}

interface StudentState {
  studentMapper: StudentMap;
}

const initialState: StudentState = {
  studentMapper: {},
};
export const StudentStateSlice = createSlice({
  name: "students",
  initialState: initialState,
  reducers: {
    setStudents: (state, action: PayloadAction<{ students: Person[] }>) => {
      const mapper: StudentMap = {};
      for (const student of action.payload.students) {
        mapper[student.id] = student;
      }
      state.studentMapper = mapper;
    },
  },
});

export const { setStudents } = StudentStateSlice.actions;

export default StudentStateSlice.reducer;
