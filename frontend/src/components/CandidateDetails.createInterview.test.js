import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import CandidateDetails from './CandidateDetails';
import { createInterview } from '../services/interviewService';

jest.mock('react-bootstrap', () => {
  const ReactLib = require('react');
  const Button = ({ children, ...props }) => <button {...props}>{children}</button>;
  const Alert = ({ children, variant, ...props }) => <div data-variant={variant} {...props}>{children}</div>;
  const Modal = ({ show, children }) => (show ? <div role="dialog">{children}</div> : null);
  Modal.Header = ({ children }) => <div>{children}</div>;
  Modal.Title = ({ children }) => <div>{children}</div>;
  Modal.Body = ({ children }) => <div>{children}</div>;
  Modal.Footer = ({ children }) => <div>{children}</div>;
  const Offcanvas = ({ show, children }) => (show ? <div role="dialog">{children}</div> : null);
  Offcanvas.Header = ({ children }) => <div>{children}</div>;
  Offcanvas.Title = ({ children }) => <div>{children}</div>;
  Offcanvas.Body = ({ children }) => <div>{children}</div>;
  const Form = ({ children, ...props }) => <form {...props}>{children}</form>;
  Form.Group = ({ children }) => <div>{children}</div>;
  Form.Label = ({ children }) => <label>{children}</label>;
  Form.Text = ({ children }) => <small>{children}</small>;
  Form.Control = ({ as, children, isInvalid, ...props }) =>
    as === 'textarea' ? (
      <textarea aria-invalid={isInvalid || undefined} {...props}>{children}</textarea>
    ) : (
      <input aria-invalid={isInvalid || undefined} {...props} />
    );
  Form.Control.Feedback = ({ children }) => <div>{children}</div>;
  Form.Select = ({ children, isInvalid, ...props }) => (
    <select aria-invalid={isInvalid || undefined} {...props}>{children}</select>
  );
  return {
    Button,
    Alert,
    Modal,
    Offcanvas,
    Form,
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, params) => {
      if (params && params.max) return `${key}:${params.max}`;
      if (params && params.star) return `${key}:${params.star}`;
      return key;
    },
  }),
}));

jest.mock('../services/interviewService', () => ({
  createInterview: jest.fn(),
  updateInterview: jest.fn(),
  deleteInterview: jest.fn(),
}));

jest.mock('../services/positionService', () => ({
  positionService: {
    removeCandidateFromPosition: jest.fn(),
  },
}));

const candidateProp = { id: 5 };

const interviewFlowSteps = [
  { id: 10, name: 'HR Screen' },
  { id: 11, name: 'Technical' },
];

const candidateDetailsPayload = {
  id: 5,
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '000000000',
  address: 'Test Street',
  educations: [],
  workExperiences: [],
  resumes: [],
  applications: [
    {
      id: 20,
      applicationDate: '2026-01-01T00:00:00.000Z',
      position: { id: 7, title: 'Frontend Engineer' },
      interviews: [],
    },
    {
      id: 21,
      applicationDate: '2026-02-01T00:00:00.000Z',
      position: { id: 8, title: 'Backend Engineer' },
      interviews: [],
    },
  ],
};

const employeesPayload = [
  { id: 1, name: 'Alice', email: 'alice@company.com' },
  { id: 2, name: 'Bob', email: 'bob@company.com' },
];

const createFetchResponse = (payload) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(payload),
  });

describe('CandidateDetails create interview flow', () => {
  beforeAll(() => {
    const matchMediaMock = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', { writable: true, value: matchMediaMock });
    global.matchMedia = matchMediaMock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url) => {
      if (url.includes('/employees')) return createFetchResponse(employeesPayload);
      if (url.includes('/interviewFlow')) {
        return createFetchResponse({
          interviewFlow: { interviewFlow: { interviewSteps: interviewFlowSteps } },
        });
      }
      return createFetchResponse(candidateDetailsPayload);
    });
  });

  it('shows "Add interview" action for each application', async () => {
    render(<CandidateDetails candidate={candidateProp} onClose={jest.fn()} />);

    const addButtons = await screen.findAllByLabelText('interviews.addInterview');
    expect(addButtons).toHaveLength(2);
  });

  it('clicking "Add interview" opens the create modal with correct title and empty fields', async () => {
    render(<CandidateDetails candidate={candidateProp} onClose={jest.fn()} />);

    const addButtons = await screen.findAllByLabelText('interviews.addInterview');
    fireEvent.click(addButtons[0]);

    expect(await screen.findByText('interviews.createTitle')).not.toBeNull();
    // The application context is shown as a read-only field
    expect(screen.getByDisplayValue('Frontend Engineer')).not.toBeNull();
    // Date field should be empty
    const dateInput = screen.getByLabelText('interviews.dateTime');
    expect(dateInput.value).toBe('');
  });

  it('shows validation errors when required fields are missing', async () => {
    render(<CandidateDetails candidate={candidateProp} onClose={jest.fn()} />);

    const addButtons = await screen.findAllByLabelText('interviews.addInterview');
    fireEvent.click(addButtons[0]);

    await screen.findByText('interviews.createTitle');

    // Submit the form directly to trigger validation
    await act(async () => {
      const forms = document.querySelectorAll('form');
      fireEvent.submit(forms[forms.length - 1]);
    });

    await waitFor(() => {
      expect(screen.getByText('validation.interviewDate.required')).not.toBeNull();
      expect(screen.getByText('validation.interviewStep.required')).not.toBeNull();
      expect(screen.getByText('validation.employee.required')).not.toBeNull();
    });
    // createInterview should not have been called
    expect(createInterview).not.toHaveBeenCalled();
  });

  it('shows validation error when notes exceed max length', async () => {
    render(<CandidateDetails candidate={candidateProp} onClose={jest.fn()} />);

    const addButtons = await screen.findAllByLabelText('interviews.addInterview');
    fireEvent.click(addButtons[0]);

    await screen.findByText('interviews.createTitle');

    // Fill required fields
    await act(async () => {
      fireEvent.change(document.querySelector('input[name="interviewDate"]'), {
        target: { name: 'interviewDate', value: '2026-07-01T10:00' },
      });
    });

    await act(async () => {
      fireEvent.change(document.querySelector('select[name="interviewStepId"]'), {
        target: { name: 'interviewStepId', value: '10' },
      });
    });

    await act(async () => {
      fireEvent.change(document.querySelector('select[name="employeeId"]'), {
        target: { name: 'employeeId', value: '1' },
      });
    });

    // Notes too long (1001 chars)
    const longNotes = 'a'.repeat(1001);
    await act(async () => {
      fireEvent.change(document.querySelector('textarea[name="notes"]'), {
        target: { name: 'notes', value: longNotes },
      });
    });

    await act(async () => {
      const forms = document.querySelectorAll('form');
      fireEvent.submit(forms[forms.length - 1]);
    });

    await waitFor(() => {
      expect(screen.getByText('validation.notes.tooLong:1000')).not.toBeNull();
    });
    expect(createInterview).not.toHaveBeenCalled();
  });

  it('successful create appends the interview and shows success message', async () => {
    const createdInterview = {
      id: 99,
      applicationId: 20,
      interviewStepId: 10,
      employeeId: 1,
      interviewDate: '2026-07-01T10:00:00.000Z',
      result: 'Pending',
      score: null,
      notes: null,
      interviewStep: { id: 10, name: 'HR Screen' },
    };
    createInterview.mockResolvedValue(createdInterview);

    render(<CandidateDetails candidate={candidateProp} onClose={jest.fn()} />);

    const addButtons = await screen.findAllByLabelText('interviews.addInterview');

    await act(async () => {
      fireEvent.click(addButtons[0]);
    });

    await screen.findByText('interviews.createTitle');

    await act(async () => {
      const dateInput = document.querySelector('input[name="interviewDate"]');
      fireEvent.change(dateInput, { target: { name: 'interviewDate', value: '2026-07-01T10:00' } });
    });

    await act(async () => {
      const stepSelect = document.querySelector('select[name="interviewStepId"]');
      fireEvent.change(stepSelect, { target: { name: 'interviewStepId', value: '10' } });
    });

    await act(async () => {
      const employeeSelect = document.querySelector('select[name="employeeId"]');
      fireEvent.change(employeeSelect, { target: { name: 'employeeId', value: '1' } });
    });

    // Submit the form and flush all async React state updates
    await act(async () => {
      const forms = document.querySelectorAll('form');
      fireEvent.submit(forms[forms.length - 1]);
    });

    // Wait for createInterview to be called (it's async inside handleCreateSubmit)
    await waitFor(() => {
      expect(createInterview).toHaveBeenCalled();
    });

    // Confirm createInterview was called with correct args
    expect(createInterview).toHaveBeenCalledWith(
      5,
      expect.objectContaining({
        applicationId: 20,
        interviewStepId: 10,
        employeeId: 1,
      })
    );

    // Modal should close and success message should appear
    await waitFor(() => expect(screen.queryByText('interviews.createTitle')).toBeNull(), { timeout: 3000 });
    expect(await screen.findByText('interviews.createSuccess', {}, { timeout: 3000 })).not.toBeNull();
  });

  it('Cancel closes the modal without making an API call', async () => {
    render(<CandidateDetails candidate={candidateProp} onClose={jest.fn()} />);

    const addButtons = await screen.findAllByLabelText('interviews.addInterview');
    fireEvent.click(addButtons[0]);

    await screen.findByText('interviews.createTitle');

    // Click the Cancel button (common.cancel key)
    const cancelButtons = screen.getAllByText('common.cancel');
    fireEvent.click(cancelButtons[cancelButtons.length - 1]);

    await waitFor(() => {
      expect(screen.queryByText('interviews.createTitle')).toBeNull();
    });
    expect(createInterview).not.toHaveBeenCalled();
  });

  it('shows error message when API call fails', async () => {
    createInterview.mockRejectedValue(new Error('Internal server error'));

    render(<CandidateDetails candidate={candidateProp} onClose={jest.fn()} />);

    const addButtons = await screen.findAllByLabelText('interviews.addInterview');
    fireEvent.click(addButtons[0]);

    await screen.findByText('interviews.createTitle');

    await act(async () => {
      const dateInput = document.querySelector('input[name="interviewDate"]');
      fireEvent.change(dateInput, { target: { name: 'interviewDate', value: '2026-07-01T10:00' } });
    });

    await act(async () => {
      const stepSelect = document.querySelector('select[name="interviewStepId"]');
      fireEvent.change(stepSelect, { target: { name: 'interviewStepId', value: '10' } });
    });

    await act(async () => {
      const employeeSelect = document.querySelector('select[name="employeeId"]');
      fireEvent.change(employeeSelect, { target: { name: 'employeeId', value: '1' } });
    });

    await act(async () => {
      const forms = document.querySelectorAll('form');
      fireEvent.submit(forms[forms.length - 1]);
    });

    await waitFor(() => {
      expect(screen.getByText('Internal server error')).not.toBeNull();
      // Modal should remain open
      expect(screen.getByText('interviews.createTitle')).not.toBeNull();
    });
  });
});
