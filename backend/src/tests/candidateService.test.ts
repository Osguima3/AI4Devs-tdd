import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { validateCandidateData } from '../application/validator';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';

jest.mock('../domain/models/Candidate');
jest.mock('../application/validator');
jest.mock('../domain/models/Education');
jest.mock('../domain/models/WorkExperience');
jest.mock('../domain/models/Resume');

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

        (Candidate as unknown as jest.Mock<Candidate>).mockImplementation((data) => ({
            ...data,
            save: jest.fn().mockResolvedValue({ id: '123', ...data }),
            education: [],
            workExperience: [],
            resumes: []
        }));

        (validateCandidateData as jest.Mock).mockImplementation(() => { });
    });

    it('should add a candidate with all fields populated', async () => {
        const savedCandidate = { id: '123', ...candidateData };
        (Education.prototype.save as jest.Mock).mockResolvedValue({});
        (WorkExperience.prototype.save as jest.Mock).mockResolvedValue({});
        (Resume.prototype.save as jest.Mock).mockResolvedValue({});

        const result = await addCandidate(candidateData);

        expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
        expect(Candidate).toHaveBeenCalledWith(candidateData);
        expect(result).toEqual(savedCandidate);
    });

    it('should throw an error if candidate data is invalid', async () => {
        (validateCandidateData as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid data');
        });

        await expect(addCandidate(candidateData)).rejects.toThrow('Invalid data');
    });

    it('should handle unique constraint violation on email', async () => {
        (Candidate.prototype.save as jest.Mock).mockImplementationOnce(() => {
            throw { code: 'P2002' };
        });

        await expect(addCandidate(candidateData)).rejects.toThrow('The email already exists in the database');
    });

    it('should handle database connection issues', async () => {
        (Candidate.prototype.save as jest.Mock).mockRejectedValue(new Error('Database connection error'));

        await expect(addCandidate(candidateData)).rejects.toThrow('Database connection error');
    });

    it('should add candidate without optional fields', async () => {
        const minimalCandidateData = { name: 'Jane Doe', email: 'jane.doe@example.com' };
        const savedCandidate = { id: '123', ...minimalCandidateData };

        const result = await addCandidate(minimalCandidateData);

        expect(validateCandidateData).toHaveBeenCalledWith(minimalCandidateData);
        expect(Candidate).toHaveBeenCalledWith(minimalCandidateData);
        expect(result).toEqual(savedCandidate);
    });

    it('should handle empty arrays for educations and workExperiences', async () => {
        candidateData.educations = [];
        candidateData.workExperiences = [];
        const savedCandidate = { id: '123', ...candidateData };

        const result = await addCandidate(candidateData);

        expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
        expect(Candidate).toHaveBeenCalledWith(candidateData);
        expect(result).toEqual(savedCandidate);
    });
});