import faker from "@faker-js/faker";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Get balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });
  it("Should be able to get balance", async () => {
    const { id } = await inMemoryUsersRepository.create({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: faker.internet.password(),
    });

    const balance = await getBalanceUseCase.execute({
      user_id: id as string,
    });

    expect(balance.statement.length).toBe(0);
    expect(balance.balance).toBe(0);
  });

  it("Should not be able to get balance when id is wrong", async () => {
    await inMemoryUsersRepository.create({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: faker.internet.password(),
    });

    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "wrongId",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
