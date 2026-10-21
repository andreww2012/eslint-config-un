declare const Injectable: () => ClassDecorator;

@Injectable()
export class InjectedService {
  constructor(
    private readonly logger: Console,
    private readonly cache: Map<string, string>,
  ) {}
}

export class PlainService {
  constructor(
    private readonly logger: Console,
    private readonly cache: Map<string, string>,
  ) {}
}
