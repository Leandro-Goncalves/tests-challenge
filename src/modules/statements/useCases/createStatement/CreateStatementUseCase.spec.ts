import faker from "@faker-js/faker";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe("Create statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to make a deposit", async () => {
    const { id } = await inMemoryUsersRepository.create({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: faker.internet.password(),
    });

    const statement = await createStatementUseCase.execute({
      user_id: id as string,
      amount: 100,
      description: "deposit test",
      type: OperationType.DEPOSIT,
    });

    expect(statement).toHaveProperty("id");
    expect(statement.user_id).toBe(id);
    expect(statement.amount).toBe(100);
    expect(statement.description).toBe("deposit test");
  });

  it("should be able to make a withdraw", async () => {
    const { id } = await inMemoryUsersRepository.create({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: faker.internet.password(),
    });

    await createStatementUseCase.execute({
      user_id: id as string,
      amount: 100,
      description: "deposit test",
      type: OperationType.DEPOSIT,
    });

    const statementWithdraw = await createStatementUseCase.execute({
      user_id: id as string,
      amount: 100,
      description: "deposit test",
      type: OperationType.WITHDRAW,
    });

    expect(statementWithdraw).toHaveProperty("id");
    expect(statementWithdraw.user_id).toBe(id);
    expect(statementWithdraw.amount).toBe(100);
    expect(statementWithdraw.description).toBe("deposit test");
  });

  it("should not be able to make a deposit with invalid user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "Wrong id",
        amount: 100,
        description: "deposit test",
        type: OperationType.DEPOSIT,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to make a withdraw without funds", async () => {
    const { id } = await inMemoryUsersRepository.create({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: faker.internet.password(),
    });

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: id as string,
        amount: 100,
        description: "deposit test",
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
