import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { faker } from "@faker-js/faker";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AppError } from "../../../../shared/errors/AppError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

const mockUser = (email?: string, name?: string, password?: string) => ({
  email: email ?? faker.internet.email(),
  name: name ?? faker.name.findName(),
  password: password ?? faker.internet.password(),
});

describe("Authenticate a User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able authenticate a user", async () => {
    const userMocked = mockUser();
    const { email, id } = await createUserUseCase.execute(userMocked);

    const { token, user } = await authenticateUserUseCase.execute({
      email,
      password: userMocked.password,
    });

    expect(token.length).toBeGreaterThan(0);
    expect(user.email).toBe(email);
    expect(user.name).toBe(userMocked.name);
    expect(user.id).toBe(id);
  });

  it("should not be able authenticate a user with wrong email or password", async () => {
    const userMocked = mockUser();
    const { email, password } = await inMemoryUsersRepository.create(
      userMocked
    );

    expect(async () => {
      await authenticateUserUseCase.execute({
        email,
        password: "wrong password",
      });
    }).rejects.toBeInstanceOf(AppError);

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "wrong email",
        password,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
