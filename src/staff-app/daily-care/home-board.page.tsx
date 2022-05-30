import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import Button from "@material-ui/core/ButtonBase";
import { Input } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortAlphaDown,
  faSortAlphaUp,
} from "@fortawesome/free-solid-svg-icons";

import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles";
import { Colors } from "shared/styles/colors";
import { CenteredContainer } from "shared/components/centered-container/centered-container.component";
import { Person } from "shared/models/person";
import { useApi } from "shared/hooks/use-api";
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component";
import {
  ActiveRollOverlay,
  ActiveRollAction,
} from "staff-app/components/active-roll-overlay/active-roll-overlay.component";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { RollStateCategorized, RolllStateType } from "shared/models/roll";
import { useAppDispatch, useAppSelector } from "store/hooks";
import { changeStudentRollstate } from "store/reducer/rollState.reducer";
import { setStudents } from "store/reducer/students.reducer";

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false);
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({
    url: "get-homeboard-students",
  });

  useEffect(() => {
    void getStudents();
  }, [getStudents]);

  const [sortMode, setSortMode] = useState<SortMode>("normal");
  const [searchString, setSearchString] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  const rollstateMap = useAppSelector((state) => state.rollState.rollStateMap);

  const dispatch = useAppDispatch();
  const onRollStateChange = (studentId: number, rollState: RolllStateType) => {
    dispatch(
      changeStudentRollstate({ studentID: studentId, rollState: rollState })
    );
  };

  useEffect(() => {
    if (data && data.students.length > 0) {
      dispatch(setStudents({ students: data.students }));
    }
  }, [data]);

  const onOverallRollStateClick = (filterBy: string) => setFilterBy(filterBy);
  const students = useMemo(() => {
    let studentsTemp = [...(data?.students || [])];
    if (sortMode === "asc") {
      studentsTemp?.sort((a, b) => a.first_name.localeCompare(b.first_name));
    }
    if (sortMode === "desc") {
      studentsTemp?.sort((a, b) => b.first_name.localeCompare(a.first_name));
    }
    if (searchString) {
      studentsTemp = studentsTemp?.filter((person) =>
        person.first_name.toLowerCase().includes(searchString)
      );
    }
    if (filterBy !== "all") {
      studentsTemp = studentsTemp?.filter(
        (student) => rollstateMap[student.id] === filterBy
      );
    }
    return studentsTemp;
  }, [data, sortMode, searchString, filterBy, onOverallRollStateClick]);

  const rollStatusMap = useMemo(() => {
    const map: RollStateCategorized = {};
    map["all"] = students?.length || 0;

    let rolledStudents = 0;
    for (const [key, value] of Object.entries(rollstateMap)) {
      map[value] = map[value] ? Number(map[value]) + 1 : 1;
      rolledStudents++;
    }
    if ((students?.length || 0) > rolledStudents) {
      const unmarked = (students?.length || 0) - rolledStudents;
      map["unmarked"] = unmarked;
    }
    return map;
  }, [rollstateMap]);

  const onToolbarAction = (action: ToolbarAction, value?: SortMode) => {
    if (action === "roll") {
      setIsRollMode(true);
    }

    if (action === "sort") {
      setSortMode(value ? value : "normal");
    }
  };

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false);
    }
  };

  return (
    <>
      <S.PageContainer>
        <Toolbar
          onItemClick={onToolbarAction}
          onSearch={(value) => setSearchString(value)}
        />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && students && (
          <>
            {students.map((s) => (
              <StudentListTile
                key={s.id}
                rollState={rollstateMap[s.id]}
                isRollMode={isRollMode}
                student={s}
                onRollStateChange={onRollStateChange}
              />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay
        onRollStateClick={onOverallRollStateClick}
        isActive={isRollMode}
        onItemClick={onActiveRollAction}
        rollState={rollStatusMap}
      />
    </>
  );
};

type ToolbarAction = "roll" | "sort";
type SortMode = "asc" | "desc" | "normal";
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: SortMode) => void;
  onSearch: (value: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onSearch, onItemClick } = props;
  const [sortMode, setSortMode] = useState<SortMode>("normal");

  const getSortMode = (mode: SortMode) => {
    if (mode === "asc") return faSortAlphaDown;
    else if (mode === "desc") return faSortAlphaUp;
    return faSort;
  };

  const handleItemClick = () => {
    const mode = sortMode === "asc" ? "desc" : "asc";
    setSortMode(mode);
    onItemClick("sort", mode);
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    onSearch(value === "" ? "" : value.toLowerCase());
  };

  return (
    <S.ToolbarContainer>
      <S.Button onClick={handleItemClick}>
        First Name{" "}
        <FontAwesomeIcon
          icon={getSortMode(sortMode) as IconProp}
          style={{ marginLeft: 5 }}
        />
      </S.Button>
      <Input
        placeholder="Search"
        onChange={handleOnChange}
        style={{ color: "white" }}
      ></Input>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  );
};

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
};
