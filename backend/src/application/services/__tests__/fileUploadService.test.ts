import { uploadFile } from '../fileUploadService';
import { Request, Response } from 'express';
import multer from 'multer';

// Mock multer
jest.mock('multer', () => {
  const mockMulter = jest.fn(() => ({
    single: jest.fn(() => jest.fn())
  }));
  
  mockMulter.diskStorage = jest.fn();
  mockMulter.MulterError = class MulterError extends Error {
    constructor(public code: string, message: string) {
      super(message);
      this.name = 'MulterError';
    }
  };
  
  return mockMulter;
});

describe('File Upload Service', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusSpy: jest.Mock;
  let jsonSpy: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn().mockReturnThis();
    
    mockRequest = {};
    mockResponse = {
      status: statusSpy,
      json: jsonSpy
    };
    
    // Reset multer mock
    (multer as unknown as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('uploadFile', () => {
    it('should successfully upload a PDF file', () => {
      const mockFile = {
        path: '/uploads/1234567890-document.pdf',
        mimetype: 'application/pdf',
        originalname: 'document.pdf'
      };
      
      mockRequest.file = mockFile as Express.Multer.File;
      
      // Mock multer single function to call callback with success
      const mockSingle = jest.fn((req, res, callback) => {
        callback(null); // No error
      });
      
      const mockUpload = {
        single: jest.fn(() => mockSingle)
      };
      
      (multer as unknown as jest.Mock).mockReturnValue(mockUpload);
      
      uploadFile(mockRequest as Request, mockResponse as Response);
      
      expect(mockUpload.single).toHaveBeenCalledWith('file');
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        filePath: mockFile.path,
        fileType: mockFile.mimetype
      });
    });

    it('should successfully upload a DOCX file', () => {
      const mockFile = {
        path: '/uploads/1234567890-document.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        originalname: 'document.docx'
      };
      
      mockRequest.file = mockFile as Express.Multer.File;
      
      const mockSingle = jest.fn((req, res, callback) => {
        callback(null); // No error
      });
      
      const mockUpload = {
        single: jest.fn(() => mockSingle)
      };
      
      (multer as unknown as jest.Mock).mockReturnValue(mockUpload);
      
      uploadFile(mockRequest as Request, mockResponse as Response);
      
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        filePath: mockFile.path,
        fileType: mockFile.mimetype
      });
    });

    it('should reject file when no file is provided', () => {
      mockRequest.file = undefined;
      
      const mockSingle = jest.fn((req, res, callback) => {
        callback(null); // No error, but no file
      });
      
      const mockUpload = {
        single: jest.fn(() => mockSingle)
      };
      
      (multer as unknown as jest.Mock).mockReturnValue(mockUpload);
      
      uploadFile(mockRequest as Request, mockResponse as Response);
      
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: 'Invalid file type, only PDF and DOCX are allowed!'
      });
    });

    it('should handle MulterError with file size limit exceeded', () => {
      const multerError = new (multer as any).MulterError('LIMIT_FILE_SIZE', 'File too large');
      
      const mockSingle = jest.fn((req, res, callback) => {
        callback(multerError);
      });
      
      const mockUpload = {
        single: jest.fn(() => mockSingle)
      };
      
      (multer as unknown as jest.Mock).mockReturnValue(mockUpload);
      
      uploadFile(mockRequest as Request, mockResponse as Response);
      
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: 'File too large'
      });
    });

    it('should handle MulterError with unexpected field', () => {
      const multerError = new (multer as any).MulterError('LIMIT_UNEXPECTED_FILE', 'Unexpected field');
      
      const mockSingle = jest.fn((req, res, callback) => {
        callback(multerError);
      });
      
      const mockUpload = {
        single: jest.fn(() => mockSingle)
      };
      
      (multer as unknown as jest.Mock).mockReturnValue(mockUpload);
      
      uploadFile(mockRequest as Request, mockResponse as Response);
      
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: 'Unexpected field'
      });
    });

    it('should handle generic errors', () => {
      const genericError = new Error('Generic error');
      
      const mockSingle = jest.fn((req, res, callback) => {
        callback(genericError);
      });
      
      const mockUpload = {
        single: jest.fn(() => mockSingle)
      };
      
      (multer as unknown as jest.Mock).mockReturnValue(mockUpload);
      
      uploadFile(mockRequest as Request, mockResponse as Response);
      
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: 'Generic error'
      });
    });

    it('should verify multer configuration', () => {
      uploadFile(mockRequest as Request, mockResponse as Response);
      
      // Verify multer was called with correct configuration
      expect(multer).toHaveBeenCalledWith({
        storage: expect.anything(),
        limits: {
          fileSize: 1024 * 1024 * 10 // 10MB
        },
        fileFilter: expect.any(Function)
      });
    });
  });

  describe('multer configuration', () => {
    it('should configure disk storage with correct destination and filename', () => {
      const mockCallback = jest.fn();
      const mockFile = { originalname: 'test.pdf' };
      
      // Test storage configuration
      uploadFile(mockRequest as Request, mockResponse as Response);
      
      expect(multer.diskStorage).toHaveBeenCalled();
      
      // Verify the storage configuration was called
      const storageConfig = (multer.diskStorage as jest.Mock).mock.calls[0][0];
      
      // Test destination
      storageConfig.destination(null, null, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, '../uploads/');
      
      // Test filename generation
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => 1234567890);
      
      storageConfig.filename(null, mockFile, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, '1234567890-test.pdf');
      
      Date.now = originalDateNow;
    });

    it('should accept PDF files in fileFilter', () => {
      const mockCallback = jest.fn();
      const mockFile = { mimetype: 'application/pdf' } as Express.Multer.File;
      
      uploadFile(mockRequest as Request, mockResponse as Response);
      
      const multerConfig = (multer as unknown as jest.Mock).mock.calls[0][0];
      const fileFilter = multerConfig.fileFilter;
      
      fileFilter(mockRequest, mockFile, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, true);
    });

    it('should accept DOCX files in fileFilter', () => {
      const mockCallback = jest.fn();
      const mockFile = { 
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      } as Express.Multer.File;
      
      uploadFile(mockRequest as Request, mockResponse as Response);
      
      const multerConfig = (multer as unknown as jest.Mock).mock.calls[0][0];
      const fileFilter = multerConfig.fileFilter;
      
      fileFilter(mockRequest, mockFile, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, true);
    });

    it('should reject non-PDF/DOCX files in fileFilter', () => {
      const mockCallback = jest.fn();
      const mockFile = { mimetype: 'image/jpeg' } as Express.Multer.File;
      
      uploadFile(mockRequest as Request, mockResponse as Response);
      
      const multerConfig = (multer as unknown as jest.Mock).mock.calls[0][0];
      const fileFilter = multerConfig.fileFilter;
      
      fileFilter(mockRequest, mockFile, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, false);
    });

    it('should reject text files in fileFilter', () => {
      const mockCallback = jest.fn();
      const mockFile = { mimetype: 'text/plain' } as Express.Multer.File;
      
      uploadFile(mockRequest as Request, mockResponse as Response);
      
      const multerConfig = (multer as unknown as jest.Mock).mock.calls[0][0];
      const fileFilter = multerConfig.fileFilter;
      
      fileFilter(mockRequest, mockFile, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, false);
    });
  });
});