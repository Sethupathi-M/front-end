import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Spacing } from "shared/styles/styles";
import { useApi } from "shared/hooks/use-api";
import { Person, PersonState } from "shared/models/person";
import { Activity } from "shared/models/activity";
import { RolllStateType } from "shared/models/roll";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@material-ui/core";
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component";

export const ActivityPage: React.FC = () => {
  const [getActivities, activityList] = useApi<{ students: Person[] }>({
    url: "get-activities",
  });
  const [getStudents, studentsData] = useApi<{ students: Person[] }>({
    url: "get-homeboard-students",
  });
  const [rollStateList, setRollStateList] = useState<
    {
      student_id: number;
      roll_state: RolllStateType;
    }[]
  >([]);
  const [studentList, setStudentList] = useState<Person[]>([]);
  useEffect(() => {
    void getActivities();
    void getStudents();
  }, []);

  useEffect(() => {
    const activityResponse = activityList as unknown as {
      activity: Activity[];
    };
    if (activityResponse?.activity?.length > 0) {
      const activityLength = activityResponse.activity.length - 1;
      const studentsRollState =
        activityResponse?.activity[activityLength]?.entity?.student_roll_states;
      setRollStateList(studentsRollState);
    }
    if (studentsData && studentsData?.students?.length > 0) {
      setStudentList(studentsData.students);
    }
  }, [activityList, studentsData]);

  const persons: PersonState[] = useMemo(() => {
    if (rollStateList.length > 0 && studentList.length > 0) {
      return studentList.map((student) => {
        const rollState = rollStateList.find(
          (state) => state.student_id === student.id
        );
        if (rollState) {
          return {
            ...student,
            rollState: rollState.roll_state,
          };
        } else {
          return { ...student, rollState: "unmark" };
        }
      });
    }
    return [];
  }, [rollStateList, studentList]);

  return (
    <S.PageContainer>
      Activity Page
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Roll State</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {persons.map((person) => (
              <TableRow key={person.id}>
                <TableCell component="th" scope="row">
                  {person.id}
                </TableCell>
                <TableCell>
                  {person.first_name} {person.last_name}
                </TableCell>
                <TableCell>
                  <RollStateIcon type={person.rollState}></RollStateIcon>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </S.PageContainer>
  );
};

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
};
