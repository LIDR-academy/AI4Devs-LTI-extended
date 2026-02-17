import React, { useState, useEffect } from 'react';
import { Offcanvas, Form, Button, Alert, Modal } from 'react-bootstrap';
import { Pencil, Trash } from 'react-bootstrap-icons';
import { createInterview, updateInterview, deleteInterview } from '../services/interviewService';

const API_BASE_URL = 'http://localhost:3010';
const NOTES_MAX_LENGTH = 1000;
const REASON_MAX_LENGTH = 500;
const INTERVIEW_RESULTS = ['Pending', 'Passed', 'Failed'];

/** Interview is deletable only when result is null or "Pending" */
const isInterviewDeletable = (interview) => {
  const result = interview?.result;
  return result == null || result === '' || result === 'Pending';
};

/** Return current date and time in datetime-local format (YYYY-MM-DDTHH:mm) */
const getNowDatetimeLocal = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const getInitialFormState = () => ({
  applicationId: '',
  interviewStepId: '',
  employeeId: '',
  interviewDate: getNowDatetimeLocal(),
  score: null,
  notes: '',
  result: 'Pending'
});

const getInitialEditFormState = () => ({
  interviewStepId: '',
  employeeId: '',
  interviewDate: '',
  score: null,
  notes: '',
  result: 'Pending'
});

/** Convert ISO date string to datetime-local input value (YYYY-MM-DDTHH:mm) */
const isoToDatetimeLocal = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CandidateDetails = ({ candidate, onClose }) => {
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [interviewSteps, setInterviewSteps] = useState([]);
  const [formData, setFormData] = useState(getInitialFormState());
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [editingInterview, setEditingInterview] = useState(null);
  const [editFormData, setEditFormData] = useState(getInitialEditFormState());
  const [editSteps, setEditSteps] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editSubmitLoading, setEditSubmitLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editValidationErrors, setEditValidationErrors] = useState({});

  const [deleteModalInterview, setDeleteModalInterview] = useState(null);
  const [deleteModalApplication, setDeleteModalApplication] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Fetch candidate details when candidate is set
  useEffect(() => {
    if (candidate) {
      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
      fetch(`${API_BASE_URL}/candidates/${candidate.id}`)
        .then((response) => response.json())
        .then((data) => setCandidateDetails(data))
        .catch((err) => {
          console.error('Error fetching candidate details:', err);
          setError('Failed to load candidate details');
        });
    }
  }, [candidate]);

  // Fetch active employees on mount (when we have a candidate to show form)
  useEffect(() => {
    if (!candidate) return;
    fetch(`${API_BASE_URL}/employees`)
      .then((response) => response.json())
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Error fetching employees:', err);
        setEmployees([]);
      });
  }, [candidate]);

  // When candidate details load, pre-select application if opened from position context
  useEffect(() => {
    if (!candidateDetails || !candidateDetails.applications?.length) return;
    const contextApplicationId = candidate?.applicationId;
    if (contextApplicationId) {
      const app = candidateDetails.applications.find((a) => Number(a.id) === Number(contextApplicationId));
      if (app) {
        setFormData((prev) => ({ ...prev, applicationId: String(app.id) }));
        fetchInterviewStepsForPosition(app.position?.id);
      }
    }
  }, [candidateDetails, candidate?.applicationId]);

  const fetchInterviewStepsForPosition = (positionId) => {
    if (!positionId) {
      setInterviewSteps([]);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE_URL}/positions/${positionId}/interviewFlow`)
      .then((response) => response.json())
      .then((data) => {
        const steps = data?.interviewFlow?.interviewFlow?.interviewSteps ?? [];
        setInterviewSteps(steps);
        setFormData((prev) =>
          steps.length > 0 && !prev.interviewStepId
            ? { ...prev, interviewStepId: String(steps[0].id) }
            : prev
        );
      })
      .catch(() => setInterviewSteps([]))
      .finally(() => setLoading(false));
  };

  const handleApplicationChange = (e) => {
    const applicationId = e.target.value;
    setFormData((prev) => ({ ...prev, applicationId, interviewStepId: '' }));
    setInterviewSteps([]);
    if (!applicationId) return;
    const app = candidateDetails?.applications?.find((a) => String(a.id) === applicationId);
    if (app?.position?.id) fetchInterviewStepsForPosition(app.position.id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) setValidationErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleScoreChange = (value) => {
    const newScore = formData.score === value ? null : value;
    setFormData((prev) => ({ ...prev, score: newScore }));
  };

  const openEditModal = (interview, application) => {
    const stepId = interview.interviewStepId ?? interview.interviewStep?.id;
    const empId = interview.employeeId;
    setEditingInterview(interview);
    setEditError(null);
    setEditValidationErrors({});
    setEditFormData({
      interviewStepId: stepId != null && stepId !== '' ? String(stepId) : '',
      employeeId: empId != null && empId !== '' ? String(empId) : '',
      interviewDate: isoToDatetimeLocal(interview.interviewDate),
      score: interview.score ?? null,
      notes: interview.notes ?? '',
      result: interview.result || 'Pending'
    });
    setEditSteps([]);
    const positionId = application?.position?.id;
    if (positionId) {
      setEditLoading(true);
      fetch(`${API_BASE_URL}/positions/${positionId}/interviewFlow`)
        .then((res) => res.json())
        .then((data) => {
          const steps = data?.interviewFlow?.interviewFlow?.interviewSteps ?? [];
          const currentStep = interview.interviewStep;
          // #region agent log
          const stepIds = (steps || []).map((s) => (s == null ? 'null' : s.id));
          fetch('http://127.0.0.1:7242/ingest/01a6f721-0594-4e0b-a031-946eb64c655e', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'CandidateDetails.js:openEditModal',
              message: 'interviewFlow steps',
              data: { currentStepIsNull: currentStep == null, stepIds },
              timestamp: Date.now(),
              hypothesisId: 'H4'
            })
          }).catch(() => {});
          // #endregion
          const hasCurrent = currentStep?.id != null && steps.some((s) => Number(s.id) === Number(currentStep.id));
          const stepsToSet = hasCurrent || !currentStep?.id ? steps : [{ id: currentStep.id, name: currentStep.name }, ...steps];
          setEditSteps(stepsToSet);
        })
        .catch(() => setEditSteps([]))
        .finally(() => setEditLoading(false));
    }
  };

  const closeEditModal = () => {
    setEditingInterview(null);
    setEditError(null);
    setEditValidationErrors({});
    setEditSteps([]);
  };

  const openDeleteModal = (interview, application) => {
    setDeleteModalInterview(interview);
    setDeleteModalApplication(application ?? null);
    setDeleteReason('');
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setDeleteModalInterview(null);
    setDeleteModalApplication(null);
    setDeleteReason('');
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    const reason = deleteReason?.trim();
    if (!reason || reason.length > REASON_MAX_LENGTH) return;
    if (!deleteModalInterview || !candidate) return;

    setDeleteError(null);
    setDeleteLoading(true);
    try {
      await deleteInterview(candidate.id, deleteModalInterview.id, reason);
      setSuccessMessage('Interview deleted successfully.');
      const appId = deleteModalInterview.applicationId ?? deleteModalApplication?.id;
      setCandidateDetails((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          applications: prev.applications.map((app) =>
            app.id === appId
              ? {
                  ...app,
                  interviews: (app.interviews || []).filter((i) => i.id !== deleteModalInterview.id)
                }
              : app
          )
        };
      });
      closeDeleteModal();
      if (editingInterview?.id === deleteModalInterview.id) {
        closeEditModal();
      }
      fetch(`${API_BASE_URL}/candidates/${candidate.id}`)
        .then((response) => response.json())
        .then((data) => setCandidateDetails(data))
        .catch(() => {});
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete interview');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (editValidationErrors[name]) setEditValidationErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleEditScoreChange = (value) => {
    const newScore = editFormData.score === value ? null : value;
    setEditFormData((prev) => ({ ...prev, score: newScore }));
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.interviewStepId) errors.interviewStepId = 'Interview step is required';
    if (!editFormData.employeeId) errors.employeeId = 'Employee is required';
    if (!editFormData.interviewDate) errors.interviewDate = 'Interview date is required';
    if (editFormData.notes && editFormData.notes.length > NOTES_MAX_LENGTH) {
      errors.notes = `Notes must not exceed ${NOTES_MAX_LENGTH} characters`;
    }
    setEditValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError(null);
    if (!validateEditForm() || !editingInterview) return;

    const interviewDateISO = editFormData.interviewDate
      ? new Date(editFormData.interviewDate).toISOString()
      : undefined;

    const payload = {
      ...(interviewDateISO && { interviewDate: interviewDateISO }),
      interviewStepId: Number(editFormData.interviewStepId),
      employeeId: Number(editFormData.employeeId),
      score: editFormData.score != null && editFormData.score !== '' ? Number(editFormData.score) : null,
      notes: editFormData.notes && editFormData.notes.trim() ? editFormData.notes.trim() : null,
      result: editFormData.result || null
    };

    setEditSubmitLoading(true);
    try {
      const updated = await updateInterview(candidate.id, editingInterview.id, payload);
      setSuccessMessage('Interview updated successfully!');
      setCandidateDetails((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          applications: prev.applications.map((app) =>
            app.id === editingInterview.applicationId
              ? {
                  ...app,
                  interviews: (app.interviews || []).map((i) =>
                    i.id === editingInterview.id ? { ...i, ...updated } : i
                  )
                }
              : app
          )
        };
      });
      closeEditModal();
    } catch (err) {
      setEditError(err.message || 'Failed to update interview');
    } finally {
      setEditSubmitLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.applicationId) errors.applicationId = 'Application is required';
    if (!formData.interviewStepId) errors.interviewStepId = 'Interview step is required';
    if (!formData.employeeId) errors.employeeId = 'Employee is required';
    if (!formData.interviewDate) errors.interviewDate = 'Interview date is required';
    if (formData.notes && formData.notes.length > NOTES_MAX_LENGTH) {
      errors.notes = `Notes must not exceed ${NOTES_MAX_LENGTH} characters`;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!validateForm()) return;

    const interviewDateISO = formData.interviewDate
      ? new Date(formData.interviewDate).toISOString()
      : null;

    const payload = {
      applicationId: Number(formData.applicationId),
      interviewStepId: Number(formData.interviewStepId),
      employeeId: Number(formData.employeeId),
      interviewDate: interviewDateISO,
      score: formData.score != null && formData.score !== '' ? Number(formData.score) : null,
      notes: formData.notes && formData.notes.trim() ? formData.notes.trim() : null,
      result: formData.result || 'Pending'
    };

    setSubmitLoading(true);
    try {
      const created = await createInterview(candidate.id, payload);
      setSuccessMessage('Interview created successfully!');
      setCandidateDetails((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          applications: prev.applications.map((app) =>
            app.id === created.applicationId
              ? { ...app, interviews: [...(app.interviews || []), created] }
              : app
          )
        };
      });
      setFormData(getInitialFormState());
      setInterviewSteps([]);
    } catch (err) {
      setError(err.message || 'Failed to create interview');
    } finally {
      setSubmitLoading(false);
    }
  };

  const applications = candidateDetails?.applications ?? [];
  const hasApplications = applications.length > 0;

  return (
    <Offcanvas show={!!candidate} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Candidate details</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {!candidateDetails ? (
          <p>Loading...</p>
        ) : (
          <>
            <h5>
              {candidateDetails.firstName} {candidateDetails.lastName}
            </h5>
            <p>Email: {candidateDetails.email}</p>
            <p>Phone: {candidateDetails.phone}</p>
            <p>Address: {candidateDetails.address}</p>

            <h5>Education</h5>
            {candidateDetails.educations?.length ? (
              candidateDetails.educations.map((edu) => (
                <div key={edu.id}>
                  <p>
                    {edu.institution} - {edu.title}
                  </p>
                  <p>
                    {new Date(edu.startDate).toLocaleDateString()} -{' '}
                    {new Date(edu.endDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p>No education listed</p>
            )}

            <h5>Work experience</h5>
            {candidateDetails.workExperiences?.length ? (
              candidateDetails.workExperiences.map((work) => (
                <div key={work.id}>
                  <p>
                    {work.company} - {work.position}
                  </p>
                  <p>{work.description}</p>
                  <p>
                    {new Date(work.startDate).toLocaleDateString()} -{' '}
                    {new Date(work.endDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p>No work experience listed</p>
            )}

            <h5>Resumes</h5>
            {candidateDetails.resumes?.length ? (
              candidateDetails.resumes.map((resume) => (
                <p key={resume.id}>
                  <a href={resume.filePath} target="_blank" rel="noopener noreferrer">
                    Download resume
                  </a>
                </p>
              ))
            ) : (
              <p>No resumes</p>
            )}

            <h5>Applications</h5>
            {applications.length ? (
              applications.map((app) => (
                <div key={app.id} className="mb-4">
                  <p>Position: {app.position?.title}</p>
                  <p>Application date: {new Date(app.applicationDate).toLocaleDateString()}</p>
                  <h5 className="mt-3 mb-2">Interviews</h5>
                  {app.interviews?.length ? (
                    [...app.interviews]
                      .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
                      .map((interview, idx) => (
                        <div
                          key={interview.id ?? idx}
                          className="rounded bg-light p-2 mb-2 d-flex justify-content-between align-items-start"
                        >
                          <div className="flex-grow-1">
                            <p className="mb-1 d-flex align-items-center gap-2 flex-wrap">
                              <strong>Date:</strong> {new Date(interview.interviewDate).toLocaleString()}
                              <span
                                className={`badge ${
                                  interview.result === 'Passed'
                                    ? 'bg-success'
                                    : interview.result === 'Failed'
                                    ? 'bg-danger'
                                    : 'bg-secondary'
                                }`}
                              >
                                {interview.result || 'Pending'}
                              </span>
                            </p>
                            <p className="mb-1"><strong>Step:</strong> {interview.interviewStep?.name}</p>
                            <p className="mb-1"><strong>Score:</strong> {interview.score != null ? `${interview.score}/5` : '-'}</p>
                            <p className="mb-0"><strong>Notes:</strong> {interview.notes ?? '-'}</p>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <Button
                              variant="link"
                              className="p-1 text-primary text-decoration-none"
                              onClick={() => openEditModal(interview, app)}
                              aria-label="Edit interview"
                            >
                              <Pencil size={18} />
                            </Button>
                            {isInterviewDeletable(interview) && (
                              <Button
                                variant="link"
                                className="p-1 text-danger text-decoration-none"
                                onClick={() => openDeleteModal({ ...interview, applicationId: app.id }, app)}
                                aria-label="Delete interview"
                              >
                                <Trash size={18} />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <p>No interviews yet</p>
                  )}
                </div>
              ))
            ) : (
              <p>No applications</p>
            )}

            <hr className="my-3" />
            <h5>Create new interview</h5>
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            {hasApplications ? (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                  <Form.Label>Application</Form.Label>
                  <Form.Select
                    name="applicationId"
                    value={formData.applicationId}
                    onChange={handleApplicationChange}
                    isInvalid={!!validationErrors.applicationId}
                  >
                    <option value="">Select an application</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.position?.title} - {new Date(app.applicationDate).toLocaleDateString()}
                      </option>
                    ))}
                  </Form.Select>
                  {validationErrors.applicationId && (
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.applicationId}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Interview date and time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="interviewDate"
                    value={formData.interviewDate}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.interviewDate}
                  />
                  {validationErrors.interviewDate && (
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.interviewDate}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Interview step</Form.Label>
                  <Form.Select
                    name="interviewStepId"
                    value={formData.interviewStepId}
                    onChange={handleInputChange}
                    disabled={!formData.applicationId || loading}
                    isInvalid={!!validationErrors.interviewStepId}
                  >
                    <option value="">Select a step</option>
                    {interviewSteps.map((step) => (
                      <option key={step.id} value={step.id}>
                        {step.name}
                      </option>
                    ))}
                  </Form.Select>
                  {validationErrors.interviewStepId && (
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.interviewStepId}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Employee</Form.Label>
                  <Form.Select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.employeeId}
                  >
                    <option value="">Select an employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </Form.Select>
                  {validationErrors.employeeId && (
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.employeeId}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Result</Form.Label>
                  <Form.Select
                    name="result"
                    value={formData.result}
                    onChange={handleInputChange}
                  >
                    {INTERVIEW_RESULTS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Score (0-5, optional)</Form.Label>
                  <div>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        role="button"
                        tabIndex={0}
                        style={{
                          cursor: 'pointer',
                          color: (formData.score ?? 0) >= star ? 'gold' : 'gray',
                          marginRight: 2
                        }}
                        onClick={() => handleScoreChange(star)}
                        onKeyDown={(e) => e.key === 'Enter' && handleScoreChange(star)}
                        aria-label={`Score ${star}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Notes (max {NOTES_MAX_LENGTH} characters)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.notes}
                  />
                  <Form.Text className="text-muted">
                    {(formData.notes || '').length}/{NOTES_MAX_LENGTH}
                  </Form.Text>
                  {validationErrors.notes && (
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.notes}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Creating...' : 'Create interview'}
                </Button>
              </Form>
            ) : (
              <p>This candidate has no applications. Create an interview from a position view.</p>
            )}

            <Modal show={!!editingInterview} onHide={closeEditModal}>
              <Modal.Header closeButton>
                <Modal.Title>Edit Interview</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {editError && <Alert variant="danger">{editError}</Alert>}
                <Form onSubmit={handleEditSubmit}>
                  <Form.Group className="mb-2">
                    <Form.Label>Interview date and time</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="interviewDate"
                      value={editFormData.interviewDate}
                      onChange={handleEditInputChange}
                      isInvalid={!!editValidationErrors.interviewDate}
                    />
                    {editValidationErrors.interviewDate && (
                      <Form.Control.Feedback type="invalid">
                        {editValidationErrors.interviewDate}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Interview step</Form.Label>
                    <Form.Select
                      name="interviewStepId"
                      value={editFormData.interviewStepId}
                      onChange={handleEditInputChange}
                      disabled={editLoading}
                      isInvalid={!!editValidationErrors.interviewStepId}
                    >
                      <option value="">Select a step</option>
                      {editSteps.map((step) => (
                        <option key={step.id} value={String(step.id)}>
                          {step.name}
                        </option>
                      ))}
                    </Form.Select>
                    {editValidationErrors.interviewStepId && (
                      <Form.Control.Feedback type="invalid">
                        {editValidationErrors.interviewStepId}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Employee</Form.Label>
                    <Form.Select
                      name="employeeId"
                      value={editFormData.employeeId}
                      onChange={handleEditInputChange}
                      isInvalid={!!editValidationErrors.employeeId}
                    >
                      <option value="">Select an employee</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={String(emp.id)}>
                          {emp.name} ({emp.email})
                        </option>
                      ))}
                    </Form.Select>
                    {editValidationErrors.employeeId && (
                      <Form.Control.Feedback type="invalid">
                        {editValidationErrors.employeeId}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Result</Form.Label>
                    <Form.Select
                      name="result"
                      value={editFormData.result}
                      onChange={handleEditInputChange}
                    >
                      {INTERVIEW_RESULTS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Score (0-5, optional)</Form.Label>
                    <div>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          role="button"
                          tabIndex={0}
                          style={{
                            cursor: 'pointer',
                            color: (editFormData.score ?? 0) >= star ? 'gold' : 'gray',
                            marginRight: 2
                          }}
                          onClick={() => handleEditScoreChange(star)}
                          onKeyDown={(e) => e.key === 'Enter' && handleEditScoreChange(star)}
                          aria-label={`Score ${star}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Notes (max {NOTES_MAX_LENGTH} characters)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      value={editFormData.notes}
                      onChange={handleEditInputChange}
                      isInvalid={!!editValidationErrors.notes}
                    />
                    <Form.Text className="text-muted">
                      {(editFormData.notes || '').length}/{NOTES_MAX_LENGTH}
                    </Form.Text>
                    {editValidationErrors.notes && (
                      <Form.Control.Feedback type="invalid">
                        {editValidationErrors.notes}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <div className="d-flex gap-2 justify-content-end flex-wrap">
                    {editingInterview != null && isInterviewDeletable(editingInterview) && (() => {
                      // #region agent log
                      const apps = candidateDetails?.applications ?? [];
                      const interviewIdsPerApp = apps.map((a) => ({
                        appId: a?.id,
                        interviewIds: (a?.interviews || []).map((x) => (x == null ? 'null' : x.id))
                      }));
                      fetch('http://127.0.0.1:7242/ingest/01a6f721-0594-4e0b-a031-946eb64c655e', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          location: 'CandidateDetails.js:appForEdit',
                          message: 'before find',
                          data: { editingInterviewId: editingInterview?.id, interviewIdsPerApp },
                          timestamp: Date.now(),
                          hypothesisId: 'post-fix'
                        })
                      }).catch(() => {});
                      // #endregion
                      const appForEdit = candidateDetails?.applications?.find((a) =>
                        (a.interviews || []).some((i) => {
                          // #region agent log
                          fetch('http://127.0.0.1:7242/ingest/01a6f721-0594-4e0b-a031-946eb64c655e', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              location: 'CandidateDetails.js:some(i)',
                              message: 'inside some callback',
                              data: { iIsNull: i == null, iId: i != null ? i.id : undefined },
                              timestamp: Date.now(),
                              hypothesisId: 'post-fix'
                            })
                          }).catch(() => {});
                          // #endregion
                          return i != null && i.id === editingInterview.id;
                        })
                      );
                      return (
                        <Button
                          variant="outline-danger"
                          onClick={() =>
                            openDeleteModal(
                              { ...editingInterview, applicationId: editingInterview.applicationId ?? appForEdit?.id },
                              appForEdit
                            )
                          }
                          disabled={editSubmitLoading}
                          className="me-auto"
                        >
                          <Trash size={16} className="me-1" />
                          Delete
                        </Button>
                      );
                    })()}
                    <Button variant="secondary" onClick={closeEditModal} disabled={editSubmitLoading}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={editSubmitLoading}>
                      {editSubmitLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>

            <Modal show={!!deleteModalInterview} onHide={closeDeleteModal}>
              <Modal.Header closeButton>
                <Modal.Title>Delete interview</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p className="text-muted mb-3">
                  This will permanently remove the interview. Please provide a reason for the deletion (required).
                </p>
                {deleteError && <Alert variant="danger">{deleteError}</Alert>}
                <Form.Group className="mb-3">
                  <Form.Label>Deletion reason</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="e.g. Interview cancelled by candidate"
                    isInvalid={deleteReason.length > REASON_MAX_LENGTH}
                  />
                  <Form.Text className="text-muted">
                    {(deleteReason || '').length}/{REASON_MAX_LENGTH}
                  </Form.Text>
                  {deleteReason.length > REASON_MAX_LENGTH && (
                    <Form.Control.Feedback type="invalid">
                      Reason must not exceed {REASON_MAX_LENGTH} characters
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
                <div className="d-flex gap-2 justify-content-end">
                  <Button variant="secondary" onClick={closeDeleteModal} disabled={deleteLoading}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDeleteConfirm}
                    disabled={deleteLoading || !deleteReason.trim() || deleteReason.length > REASON_MAX_LENGTH}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </Modal.Body>
            </Modal>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default CandidateDetails;
