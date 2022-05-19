import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { faker } from "@faker-js/faker";
import { AppError } from "../../../../shared/errors/AppError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

const mockUser = (email?: string, name?: string, password?: string) => ({
  email: email ?? faker.internet.email(),
  name: name ?? faker.name.findName(),
  password: password ?? faker.internet.password(),
});

describe("Create a new User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });
  it("should be able to create a new user", async () => {
    const userMocked = mockUser();
    const user = await createUserUseCase.execute(userMocked);

    expect(user.email).toBe(userMocked.email);
    expect(user.name).toBe(userMocked.name);
  });

  it("should not be able to create a new user when exists a user with same email", async () => {
    const userMocked = mockUser();
    await createUserUseCase.execute(userMocked);

    expect(async () => {
      const userWithSameEmail = mockUser(userMocked.email);
      await createUserUseCase.execute(userWithSameEmail);
    }).rejects.toBeInstanceOf(AppError);
  });
});
