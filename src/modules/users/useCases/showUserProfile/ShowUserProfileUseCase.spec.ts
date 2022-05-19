import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { faker } from "@faker-js/faker";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AppError } from "../../../../shared/errors/AppError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

const mockUser = (email?: string, name?: string, password?: string) => ({
  email: email ?? faker.internet.email(),
  name: name ?? faker.name.findName(),
  password: password ?? faker.internet.password(),
});

describe("Show a user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show a user profile", async () => {
    const userMocked = mockUser();
    const { id, email, name, password } = await createUserUseCase.execute(
      userMocked
    );

    const user = await showUserProfileUseCase.execute(id as string);

    expect(user.id).toBe(id);
    expect(user.email).toBe(email);
    expect(user.name).toBe(name);
    expect(user.password).toBe(password);
  });
  it("should not be able to show a user profile with wrong id", async () => {
    const userMocked = mockUser();
    await createUserUseCase.execute(userMocked);

    expect(async () => {
      await showUserProfileUseCase.execute("wrongId");
    }).rejects.toBeInstanceOf(AppError);
  });
});
