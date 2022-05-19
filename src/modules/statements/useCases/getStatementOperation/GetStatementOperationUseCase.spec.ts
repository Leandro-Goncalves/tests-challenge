import faker from "@faker-js/faker";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { v4 as uuidV4 } from "uuid";

let getStatementOperationUseCase: GetStatementOperationUseCase;

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

const statementMock = (
  user_id?: string,
  amount?: number,
  description?: string,
  type?: OperationType
) => ({
  user_id: user_id ?? uuidV4(),
  amount: amount ?? faker.datatype.number(),
  description: description ?? faker.lorem.lines(),
  type: type ?? OperationType.WITHDRAW,
});

describe("Get statement operation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to get statement operation deposit", async () => {
    const { id } = await inMemoryUsersRepository.create({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: faker.internet.password(),
    });

    const statementDeposit = statementMock(
      id as string,
      100,
      undefined,
      OperationType.DEPOSIT
    );
    const { id: statement_id } = await inMemoryStatementsRepository.create(
      statementDeposit
    );

    const statement = await getStatementOperationUseCase.execute({
      user_id: id as string,
      statement_id: statement_id as string,
    });

    expect(statement.amount).toBe(100);
    expect(statement.type).toBe(OperationType.DEPOSIT);
  });

  it("Should be able to get statement operation withdraw", async () => {
    const { id } = await inMemoryUsersRepository.create({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: faker.internet.password(),
    });

    const statementWithdraw = statementMock(
      id as string,
      50,
      undefined,
      OperationType.WITHDRAW
    );
    const { id: statement_id } = await inMemoryStatementsRepository.create(
      statementWithdraw
    );

    const statement = await getStatementOperationUseCase.execute({
      user_id: id as string,
      statement_id: statement_id as string,
    });

    expect(statement.amount).toBe(50);
    expect(statement.type).toBe(OperationType.WITHDRAW);
  });

  it("Should not be able to get statement operation with invalid user_id", async () => {
    const statementWithdraw = statementMock();
    const { id: statement_id } = await inMemoryStatementsRepository.create(
      statementWithdraw
    );

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "WrongId",
        statement_id: statement_id as string,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to get statement operation with invalid statement_id", async () => {
    const { id: user_id } = await inMemoryUsersRepository.create({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: faker.internet.password(),
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: user_id as string,
        statement_id: "WrongId",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
