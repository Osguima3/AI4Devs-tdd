import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { validateCandidateData } from '../application/validator';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';

jest.mock('../application/validator');

describe('addCandidate', () => {
    let candidateData: any;

    beforeEach(() => {
        candidateData = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            educations: [{ degree: 'BSc', institution: 'University' }],
            workExperiences: [{ title: 'Developer', company: 'Company' }],
            cv: { fileName: 'resume.pdf', fileContent: '...' }
        };

        jest.spyOn(Candidate.prototype, 'save').mockImplementation(() => Promise.resolve({
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: null,
            address: null
        }));
        jest.spyOn(Education.prototype, 'save').mockImplementation(() => Promise.resolve({
            id: 2,
            institution: 'University',
            title: 'BSc',
            startDate: new Date(),
            endDate: null,
            candidateId: 1
        }));
        jest.spyOn(WorkExperience.prototype, 'save').mockImplementation(() => Promise.resolve({
            id: 3,
            startDate: new Date(),
            endDate: null,
            candidateId: 1,
            company: 'Company',
            position: 'Developer',
            description: null
        }));
        jest.spyOn(Resume.prototype, 'save').mockImplementation(() => {
            const resume = {
                id: 4,
                candidateId: 1,
                filePath: 'path/to/resume.pdf',
                fileType: 'application/pdf',
                uploadDate: new Date(),
                fileName: 'resume.pdf',
            };
            return Promise.resolve(
                { ...resume, save: () => Promise.resolve(resume), create: () => Promise.resolve(resume) } as unknown as Promise<Resume>
            );
        });

        (validateCandidateData as jest.Mock).mockImplementation(() => { });
    });

    it('should add a candidate with all fields populated', async () => {
        const savedCandidate = { id: '123', ...candidateData };
        const candidateSaveSpy = jest.spyOn(Candidate.prototype, 'save').mockResolvedValue(savedCandidate);
        const educationSaveSpy = jest.spyOn(Education.prototype, 'save').mockResolvedValue({ id: 2, ...candidateData.educations[0] });
        const workExperienceSaveSpy = jest.spyOn(WorkExperience.prototype, 'save').mockResolvedValue({ id: 3, ...candidateData.workExperiences[0] });
        const resumeSaveSpy = jest.spyOn(Resume.prototype, 'save').mockResolvedValue({ id: 4, ...candidateData.cv });

        const result = await addCandidate(candidateData);

        expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
        expect(result).toEqual(savedCandidate);
        expect(candidateSaveSpy).toHaveBeenCalled();
        expect(educationSaveSpy).toHaveBeenCalled();
        expect(workExperienceSaveSpy).toHaveBeenCalled();
        expect(resumeSaveSpy).toHaveBeenCalled();

        candidateSaveSpy.mockRestore();
        educationSaveSpy.mockRestore();
        workExperienceSaveSpy.mockRestore();
        resumeSaveSpy.mockRestore();
    });

    it('should throw an error if candidate data is invalid', async () => {
        (validateCandidateData as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid data');
        });

        await expect(addCandidate(candidateData)).rejects.toThrow('Invalid data');
    });

    it('should handle unique constraint violation on email', async () => {
        const candidateSaveSpy = jest.spyOn(Candidate.prototype, 'save').mockRejectedValue({ code: 'P2002' });

        await expect(addCandidate(candidateData)).rejects.toThrow('The email already exists in the database');

        candidateSaveSpy.mockRestore();
    });

    it('should handle database connection issues', async () => {
        const candidateSaveSpy = jest.spyOn(Candidate.prototype, 'save').mockRejectedValue(new Error('Database connection error'));

        await expect(addCandidate(candidateData)).rejects.toThrow('Database connection error');

        candidateSaveSpy.mockRestore();
    });

    it('should add candidate without optional fields', async () => {
        candidateData.educations = undefined;
        candidateData.workExperiences = undefined;
        const savedCandidate = { id: '124', ...candidateData };
        const candidateSaveSpy = jest.spyOn(Candidate.prototype, 'save').mockResolvedValue(savedCandidate);

        const result = await addCandidate(candidateData);

        expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
        expect(result).toEqual(savedCandidate);
        expect(candidateSaveSpy).toHaveBeenCalled();

        candidateSaveSpy.mockRestore();
    });

    it('should handle empty arrays for educations and workExperiences', async () => {
        candidateData.educations = [];
        candidateData.workExperiences = [];
        const savedCandidate = { id: '125', ...candidateData };
        const candidateSaveSpy = jest.spyOn(Candidate.prototype, 'save').mockResolvedValue(savedCandidate);

        const result = await addCandidate(candidateData);

        expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
        expect(result).toEqual(savedCandidate);
        expect(candidateSaveSpy).toHaveBeenCalled();

        candidateSaveSpy.mockRestore();
    });
});