import API from '../utils/api/apiClient';

export const CR_MATERIAL_TYPE = {
  CLASS_NOTE: 'Class Note',
  CT_QUESTION: 'CT Question',
  LECTURE_SLIDE: 'Lecture Slide',
  SEMESTER_QUESTION: 'Semester Question',
} as const;

export const CR_MATERIAL_TYPE_KEY = {
  CLASS_NOTE: 'class_note',
  CT_QUESTION: 'ct_question',
  LECTURE_SLIDE: 'lecture_slide',
  SEMESTER_QUESTION: 'semester_question',
} as const;

export type CRMaterialType = typeof CR_MATERIAL_TYPE[keyof typeof CR_MATERIAL_TYPE];

function encodeId(id: string | number | null | undefined): string {
  return encodeURIComponent(String(id ?? '').trim());
}

// Upload endpoints
export async function uploadCrClassNote(payload: any) {
  const response = await API.post('/api/v1/crs/materials/class-notes', payload);
  return response?.data;
}

export async function uploadCrCtQuestion(payload: any) {
  const response = await API.post('/api/v1/crs/materials/ct-questions', payload);
  return response?.data;
}

export async function uploadCrLectureSlide(payload: any) {
  const response = await API.post('/api/v1/crs/materials/lecture-slides', payload);
  return response?.data;
}

export async function uploadCrSemesterQuestion(payload: any) {
  const response = await API.post('/api/v1/crs/materials/semester-questions', payload);
  return response?.data;
}

// List endpoints
export async function listCrClassNotes() {
  const response = await API.get('/api/v1/crs/materials/class-notes');
  return Array.isArray(response?.data) ? response.data : [];
}

export async function listCrCtQuestions() {
  const response = await API.get('/api/v1/crs/materials/ct-questions');
  return Array.isArray(response?.data) ? response.data : [];
}

export async function listCrLectureSlides() {
  const response = await API.get('/api/v1/crs/materials/lecture-slides');
  return Array.isArray(response?.data) ? response.data : [];
}

export async function listCrSemesterQuestions() {
  const response = await API.get('/api/v1/crs/materials/semester-questions');
  return Array.isArray(response?.data) ? response.data : [];
}

// Get by ID endpoints
export async function getCrClassNoteById(noteId: string) {
  const response = await API.get(`/api/v1/crs/materials/class-notes/${encodeId(noteId)}`);
  return response?.data;
}

export async function getCrCtQuestionById(ctId: string) {
  const response = await API.get(`/api/v1/crs/materials/ct-questions/${encodeId(ctId)}`);
  return response?.data;
}

export async function getCrLectureSlideById(slideId: string) {
  const response = await API.get(`/api/v1/crs/materials/lecture-slides/${encodeId(slideId)}`);
  return response?.data;
}

export async function getCrSemesterQuestionById(sqId: string) {
  const response = await API.get(`/api/v1/crs/materials/semester-questions/${encodeId(sqId)}`);
  return response?.data;
}

// Update endpoints
export async function updateCrClassNote(noteId: string, payload: any) {
  const response = await API.patch(`/api/v1/crs/materials/class-notes/${encodeId(noteId)}`, payload);
  return response?.data;
}

export async function updateCrCtQuestion(ctId: string, payload: any) {
  const response = await API.patch(`/api/v1/crs/materials/ct-questions/${encodeId(ctId)}`, payload);
  return response?.data;
}

export async function updateCrLectureSlide(slideId: string, payload: any) {
  const response = await API.patch(`/api/v1/crs/materials/lecture-slides/${encodeId(slideId)}`, payload);
  return response?.data;
}

export async function updateCrSemesterQuestion(sqId: string, payload: any) {
  const response = await API.patch(`/api/v1/crs/materials/semester-questions/${encodeId(sqId)}`, payload);
  return response?.data;
}

// Unified helpers
export async function uploadCrMaterial(materialType: string, payload: any) {
  switch (materialType) {
    case CR_MATERIAL_TYPE.CLASS_NOTE:
      return uploadCrClassNote(payload);
    case CR_MATERIAL_TYPE.CT_QUESTION:
      return uploadCrCtQuestion(payload);
    case CR_MATERIAL_TYPE.LECTURE_SLIDE:
      return uploadCrLectureSlide(payload);
    case CR_MATERIAL_TYPE.SEMESTER_QUESTION:
      return uploadCrSemesterQuestion(payload);
    default:
      throw new Error('Please select a valid material type.');
  }
}

export async function getCrMaterialByTypeAndId(materialType: string, materialId: string) {
  switch (materialType) {
    case CR_MATERIAL_TYPE.CLASS_NOTE:
      return getCrClassNoteById(materialId);
    case CR_MATERIAL_TYPE.CT_QUESTION:
      return getCrCtQuestionById(materialId);
    case CR_MATERIAL_TYPE.LECTURE_SLIDE:
      return getCrLectureSlideById(materialId);
    case CR_MATERIAL_TYPE.SEMESTER_QUESTION:
      return getCrSemesterQuestionById(materialId);
    default:
      throw new Error('Invalid material type');
  }
}

export async function updateCrMaterial(materialType: string, materialId: string, payload: any) {
  switch (materialType) {
    case CR_MATERIAL_TYPE.CLASS_NOTE:
      return updateCrClassNote(materialId, payload);
    case CR_MATERIAL_TYPE.CT_QUESTION:
      return updateCrCtQuestion(materialId, payload);
    case CR_MATERIAL_TYPE.LECTURE_SLIDE:
      return updateCrLectureSlide(materialId, payload);
    case CR_MATERIAL_TYPE.SEMESTER_QUESTION:
      return updateCrSemesterQuestion(materialId, payload);
    default:
      throw new Error('Invalid material type');
  }
}

export async function listAllCrMaterials() {
  const [classNotes, ctQuestions, lectureSlides, semesterQuestions] = await Promise.all([
    listCrClassNotes(),
    listCrCtQuestions(),
    listCrLectureSlides(),
    listCrSemesterQuestions(),
  ]);

  return [
    ...classNotes.map((n: any) => ({ ...n, _materialType: CR_MATERIAL_TYPE.CLASS_NOTE })),
    ...ctQuestions.map((n: any) => ({ ...n, _materialType: CR_MATERIAL_TYPE.CT_QUESTION })),
    ...lectureSlides.map((n: any) => ({ ...n, _materialType: CR_MATERIAL_TYPE.LECTURE_SLIDE })),
    ...semesterQuestions.map((n: any) => ({ ...n, _materialType: CR_MATERIAL_TYPE.SEMESTER_QUESTION })),
  ];
}
