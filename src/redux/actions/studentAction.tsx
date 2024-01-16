import { Dispatch } from 'redux';
import { FETCH_STUDENTS_REQUEST, FETCH_STUDENTS_SUCCESS, FETCH_STUDENTS_FAILURE } from '../type/actionTypes';
import axios from 'axios';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;

}

// Action types
interface FetchStudentsRequestAction {
  type: typeof FETCH_STUDENTS_REQUEST;
}

interface FetchStudentsSuccessAction {
  type: typeof FETCH_STUDENTS_SUCCESS;
  payload: Student[];
}

interface FetchStudentsFailureAction {
  type: typeof FETCH_STUDENTS_FAILURE;
  payload: string; 
}

// Union type for all actions
export type StudentActionTypes = FetchStudentsRequestAction | FetchStudentsSuccessAction | FetchStudentsFailureAction;

// Action creators
export const fetchStudentsRequest = (): FetchStudentsRequestAction => ({
  type: FETCH_STUDENTS_REQUEST,
});

export const fetchStudentsSuccess = (students: Student[]): FetchStudentsSuccessAction => ({
  type: FETCH_STUDENTS_SUCCESS,
  payload: students,
});

export const fetchStudentsFailure = (error: string): FetchStudentsFailureAction => ({
  type: FETCH_STUDENTS_FAILURE,
  payload: error,
});

// Async action (thunk)
export const fetchStudents = () => {
  return async (dispatch: Dispatch<StudentActionTypes>) => {
    dispatch(fetchStudentsRequest());

    try {
      const response = await axios.get('http://localhost:8200/api/students');
      dispatch(fetchStudentsSuccess(response.data.data));
    } catch (error) {
      dispatch(fetchStudentsFailure(error.message));
    }
  };
}
