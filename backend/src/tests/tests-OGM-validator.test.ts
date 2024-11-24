import { validateCandidateData } from '../application/validator';

describe('validateCandidateData', () => {
    let candidateData: any;

    beforeEach(() => {
        candidateData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '612345678',
            address: '123 Main St',
            educations: [{ institution: 'University', title: 'BSc', startDate: '2020-01-01' }],
            workExperiences: [{ company: 'Company', position: 'Developer', startDate: '2021-01-01' }],
            cv: { filePath: 'resume.pdf', fileType: 'application/pdf' }
        };
    });

    it('should pass for valid candidate data with all fields populated', () => {
        expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass for valid candidate data with optional fields missing', () => {
        delete candidateData.phone;
        delete candidateData.address;
        expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should throw an error for invalid name', () => {
        candidateData.firstName = 'J';
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('should throw an error for invalid email', () => {
        candidateData.email = 'invalid-email';
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
    });

    it('should throw an error for invalid phone', () => {
        candidateData.phone = '12345';
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid phone');
    });

    it('should throw an error for invalid address', () => {
        candidateData.address = 'a'.repeat(101);
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid address');
    });

    it('should throw an error for invalid education', () => {
        candidateData.educations[0].institution = '';
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid institution');
    });

    it('should throw an error for invalid work experience', () => {
        candidateData.workExperiences[0].company = '';
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid company');
    });

    it('should throw an error for invalid CV', () => {
        candidateData.cv = { filePath: '', fileType: '' };
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid CV data');
    });

    it('should pass for candidate data with empty arrays for educations and workExperiences', () => {
        candidateData.educations = [];
        candidateData.workExperiences = [];
        expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass for candidate data with null or undefined fields', () => {
        candidateData.phone = null;
        candidateData.address = undefined;
        expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should throw an error for candidate data with invalid education date', () => {
        candidateData.educations[0].startDate = 'invalid-date';
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid date');
    });

    it('should throw an error for candidate data with invalid work experience date', () => {
        candidateData.workExperiences[0].startDate = 'invalid-date';
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid date');
    });
});