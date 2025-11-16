
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Execution
 * 
 */
export type Execution = $Result.DefaultSelection<Prisma.$ExecutionPayload>
/**
 * Model ExecutionLog
 * 
 */
export type ExecutionLog = $Result.DefaultSelection<Prisma.$ExecutionLogPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const ExecutionStatus: {
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

export type ExecutionStatus = (typeof ExecutionStatus)[keyof typeof ExecutionStatus]


export const LogStatus: {
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  RETRYING: 'RETRYING'
};

export type LogStatus = (typeof LogStatus)[keyof typeof LogStatus]

}

export type ExecutionStatus = $Enums.ExecutionStatus

export const ExecutionStatus: typeof $Enums.ExecutionStatus

export type LogStatus = $Enums.LogStatus

export const LogStatus: typeof $Enums.LogStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Executions
 * const executions = await prisma.execution.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Executions
   * const executions = await prisma.execution.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.execution`: Exposes CRUD operations for the **Execution** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Executions
    * const executions = await prisma.execution.findMany()
    * ```
    */
  get execution(): Prisma.ExecutionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.executionLog`: Exposes CRUD operations for the **ExecutionLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ExecutionLogs
    * const executionLogs = await prisma.executionLog.findMany()
    * ```
    */
  get executionLog(): Prisma.ExecutionLogDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.0
   * Query Engine version: 2ba551f319ab1df4bc874a89965d8b3641056773
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Execution: 'Execution',
    ExecutionLog: 'ExecutionLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "execution" | "executionLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Execution: {
        payload: Prisma.$ExecutionPayload<ExtArgs>
        fields: Prisma.ExecutionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExecutionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExecutionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionPayload>
          }
          findFirst: {
            args: Prisma.ExecutionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExecutionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionPayload>
          }
          findMany: {
            args: Prisma.ExecutionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionPayload>[]
          }
          create: {
            args: Prisma.ExecutionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionPayload>
          }
          createMany: {
            args: Prisma.ExecutionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExecutionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionPayload>[]
          }
          delete: {
            args: Prisma.ExecutionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionPayload>
          }
          update: {
            args: Prisma.ExecutionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionPayload>
          }
          deleteMany: {
            args: Prisma.ExecutionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExecutionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ExecutionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionPayload>[]
          }
          upsert: {
            args: Prisma.ExecutionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionPayload>
          }
          aggregate: {
            args: Prisma.ExecutionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExecution>
          }
          groupBy: {
            args: Prisma.ExecutionGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExecutionGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExecutionCountArgs<ExtArgs>
            result: $Utils.Optional<ExecutionCountAggregateOutputType> | number
          }
        }
      }
      ExecutionLog: {
        payload: Prisma.$ExecutionLogPayload<ExtArgs>
        fields: Prisma.ExecutionLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExecutionLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExecutionLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionLogPayload>
          }
          findFirst: {
            args: Prisma.ExecutionLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExecutionLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionLogPayload>
          }
          findMany: {
            args: Prisma.ExecutionLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionLogPayload>[]
          }
          create: {
            args: Prisma.ExecutionLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionLogPayload>
          }
          createMany: {
            args: Prisma.ExecutionLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExecutionLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionLogPayload>[]
          }
          delete: {
            args: Prisma.ExecutionLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionLogPayload>
          }
          update: {
            args: Prisma.ExecutionLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionLogPayload>
          }
          deleteMany: {
            args: Prisma.ExecutionLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExecutionLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ExecutionLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionLogPayload>[]
          }
          upsert: {
            args: Prisma.ExecutionLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExecutionLogPayload>
          }
          aggregate: {
            args: Prisma.ExecutionLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExecutionLog>
          }
          groupBy: {
            args: Prisma.ExecutionLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExecutionLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExecutionLogCountArgs<ExtArgs>
            result: $Utils.Optional<ExecutionLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    execution?: ExecutionOmit
    executionLog?: ExecutionLogOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ExecutionCountOutputType
   */

  export type ExecutionCountOutputType = {
    logs: number
  }

  export type ExecutionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    logs?: boolean | ExecutionCountOutputTypeCountLogsArgs
  }

  // Custom InputTypes
  /**
   * ExecutionCountOutputType without action
   */
  export type ExecutionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionCountOutputType
     */
    select?: ExecutionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ExecutionCountOutputType without action
   */
  export type ExecutionCountOutputTypeCountLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExecutionLogWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Execution
   */

  export type AggregateExecution = {
    _count: ExecutionCountAggregateOutputType | null
    _avg: ExecutionAvgAggregateOutputType | null
    _sum: ExecutionSumAggregateOutputType | null
    _min: ExecutionMinAggregateOutputType | null
    _max: ExecutionMaxAggregateOutputType | null
  }

  export type ExecutionAvgAggregateOutputType = {
    currentNodeIndex: number | null
  }

  export type ExecutionSumAggregateOutputType = {
    currentNodeIndex: number | null
  }

  export type ExecutionMinAggregateOutputType = {
    id: string | null
    workflowId: string | null
    status: $Enums.ExecutionStatus | null
    currentNodeIndex: number | null
    startedAt: Date | null
    finishedAt: Date | null
  }

  export type ExecutionMaxAggregateOutputType = {
    id: string | null
    workflowId: string | null
    status: $Enums.ExecutionStatus | null
    currentNodeIndex: number | null
    startedAt: Date | null
    finishedAt: Date | null
  }

  export type ExecutionCountAggregateOutputType = {
    id: number
    workflowId: number
    status: number
    currentNodeIndex: number
    startedAt: number
    finishedAt: number
    _all: number
  }


  export type ExecutionAvgAggregateInputType = {
    currentNodeIndex?: true
  }

  export type ExecutionSumAggregateInputType = {
    currentNodeIndex?: true
  }

  export type ExecutionMinAggregateInputType = {
    id?: true
    workflowId?: true
    status?: true
    currentNodeIndex?: true
    startedAt?: true
    finishedAt?: true
  }

  export type ExecutionMaxAggregateInputType = {
    id?: true
    workflowId?: true
    status?: true
    currentNodeIndex?: true
    startedAt?: true
    finishedAt?: true
  }

  export type ExecutionCountAggregateInputType = {
    id?: true
    workflowId?: true
    status?: true
    currentNodeIndex?: true
    startedAt?: true
    finishedAt?: true
    _all?: true
  }

  export type ExecutionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Execution to aggregate.
     */
    where?: ExecutionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Executions to fetch.
     */
    orderBy?: ExecutionOrderByWithRelationInput | ExecutionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExecutionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Executions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Executions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Executions
    **/
    _count?: true | ExecutionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ExecutionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ExecutionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExecutionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExecutionMaxAggregateInputType
  }

  export type GetExecutionAggregateType<T extends ExecutionAggregateArgs> = {
        [P in keyof T & keyof AggregateExecution]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExecution[P]>
      : GetScalarType<T[P], AggregateExecution[P]>
  }




  export type ExecutionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExecutionWhereInput
    orderBy?: ExecutionOrderByWithAggregationInput | ExecutionOrderByWithAggregationInput[]
    by: ExecutionScalarFieldEnum[] | ExecutionScalarFieldEnum
    having?: ExecutionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExecutionCountAggregateInputType | true
    _avg?: ExecutionAvgAggregateInputType
    _sum?: ExecutionSumAggregateInputType
    _min?: ExecutionMinAggregateInputType
    _max?: ExecutionMaxAggregateInputType
  }

  export type ExecutionGroupByOutputType = {
    id: string
    workflowId: string
    status: $Enums.ExecutionStatus
    currentNodeIndex: number
    startedAt: Date
    finishedAt: Date | null
    _count: ExecutionCountAggregateOutputType | null
    _avg: ExecutionAvgAggregateOutputType | null
    _sum: ExecutionSumAggregateOutputType | null
    _min: ExecutionMinAggregateOutputType | null
    _max: ExecutionMaxAggregateOutputType | null
  }

  type GetExecutionGroupByPayload<T extends ExecutionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExecutionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExecutionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExecutionGroupByOutputType[P]>
            : GetScalarType<T[P], ExecutionGroupByOutputType[P]>
        }
      >
    >


  export type ExecutionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    workflowId?: boolean
    status?: boolean
    currentNodeIndex?: boolean
    startedAt?: boolean
    finishedAt?: boolean
    logs?: boolean | Execution$logsArgs<ExtArgs>
    _count?: boolean | ExecutionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["execution"]>

  export type ExecutionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    workflowId?: boolean
    status?: boolean
    currentNodeIndex?: boolean
    startedAt?: boolean
    finishedAt?: boolean
  }, ExtArgs["result"]["execution"]>

  export type ExecutionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    workflowId?: boolean
    status?: boolean
    currentNodeIndex?: boolean
    startedAt?: boolean
    finishedAt?: boolean
  }, ExtArgs["result"]["execution"]>

  export type ExecutionSelectScalar = {
    id?: boolean
    workflowId?: boolean
    status?: boolean
    currentNodeIndex?: boolean
    startedAt?: boolean
    finishedAt?: boolean
  }

  export type ExecutionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "workflowId" | "status" | "currentNodeIndex" | "startedAt" | "finishedAt", ExtArgs["result"]["execution"]>
  export type ExecutionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    logs?: boolean | Execution$logsArgs<ExtArgs>
    _count?: boolean | ExecutionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ExecutionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ExecutionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ExecutionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Execution"
    objects: {
      logs: Prisma.$ExecutionLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      workflowId: string
      status: $Enums.ExecutionStatus
      currentNodeIndex: number
      startedAt: Date
      finishedAt: Date | null
    }, ExtArgs["result"]["execution"]>
    composites: {}
  }

  type ExecutionGetPayload<S extends boolean | null | undefined | ExecutionDefaultArgs> = $Result.GetResult<Prisma.$ExecutionPayload, S>

  type ExecutionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ExecutionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ExecutionCountAggregateInputType | true
    }

  export interface ExecutionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Execution'], meta: { name: 'Execution' } }
    /**
     * Find zero or one Execution that matches the filter.
     * @param {ExecutionFindUniqueArgs} args - Arguments to find a Execution
     * @example
     * // Get one Execution
     * const execution = await prisma.execution.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExecutionFindUniqueArgs>(args: SelectSubset<T, ExecutionFindUniqueArgs<ExtArgs>>): Prisma__ExecutionClient<$Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Execution that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ExecutionFindUniqueOrThrowArgs} args - Arguments to find a Execution
     * @example
     * // Get one Execution
     * const execution = await prisma.execution.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExecutionFindUniqueOrThrowArgs>(args: SelectSubset<T, ExecutionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExecutionClient<$Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Execution that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionFindFirstArgs} args - Arguments to find a Execution
     * @example
     * // Get one Execution
     * const execution = await prisma.execution.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExecutionFindFirstArgs>(args?: SelectSubset<T, ExecutionFindFirstArgs<ExtArgs>>): Prisma__ExecutionClient<$Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Execution that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionFindFirstOrThrowArgs} args - Arguments to find a Execution
     * @example
     * // Get one Execution
     * const execution = await prisma.execution.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExecutionFindFirstOrThrowArgs>(args?: SelectSubset<T, ExecutionFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExecutionClient<$Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Executions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Executions
     * const executions = await prisma.execution.findMany()
     * 
     * // Get first 10 Executions
     * const executions = await prisma.execution.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const executionWithIdOnly = await prisma.execution.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ExecutionFindManyArgs>(args?: SelectSubset<T, ExecutionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Execution.
     * @param {ExecutionCreateArgs} args - Arguments to create a Execution.
     * @example
     * // Create one Execution
     * const Execution = await prisma.execution.create({
     *   data: {
     *     // ... data to create a Execution
     *   }
     * })
     * 
     */
    create<T extends ExecutionCreateArgs>(args: SelectSubset<T, ExecutionCreateArgs<ExtArgs>>): Prisma__ExecutionClient<$Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Executions.
     * @param {ExecutionCreateManyArgs} args - Arguments to create many Executions.
     * @example
     * // Create many Executions
     * const execution = await prisma.execution.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExecutionCreateManyArgs>(args?: SelectSubset<T, ExecutionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Executions and returns the data saved in the database.
     * @param {ExecutionCreateManyAndReturnArgs} args - Arguments to create many Executions.
     * @example
     * // Create many Executions
     * const execution = await prisma.execution.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Executions and only return the `id`
     * const executionWithIdOnly = await prisma.execution.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExecutionCreateManyAndReturnArgs>(args?: SelectSubset<T, ExecutionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Execution.
     * @param {ExecutionDeleteArgs} args - Arguments to delete one Execution.
     * @example
     * // Delete one Execution
     * const Execution = await prisma.execution.delete({
     *   where: {
     *     // ... filter to delete one Execution
     *   }
     * })
     * 
     */
    delete<T extends ExecutionDeleteArgs>(args: SelectSubset<T, ExecutionDeleteArgs<ExtArgs>>): Prisma__ExecutionClient<$Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Execution.
     * @param {ExecutionUpdateArgs} args - Arguments to update one Execution.
     * @example
     * // Update one Execution
     * const execution = await prisma.execution.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExecutionUpdateArgs>(args: SelectSubset<T, ExecutionUpdateArgs<ExtArgs>>): Prisma__ExecutionClient<$Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Executions.
     * @param {ExecutionDeleteManyArgs} args - Arguments to filter Executions to delete.
     * @example
     * // Delete a few Executions
     * const { count } = await prisma.execution.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExecutionDeleteManyArgs>(args?: SelectSubset<T, ExecutionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Executions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Executions
     * const execution = await prisma.execution.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExecutionUpdateManyArgs>(args: SelectSubset<T, ExecutionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Executions and returns the data updated in the database.
     * @param {ExecutionUpdateManyAndReturnArgs} args - Arguments to update many Executions.
     * @example
     * // Update many Executions
     * const execution = await prisma.execution.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Executions and only return the `id`
     * const executionWithIdOnly = await prisma.execution.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ExecutionUpdateManyAndReturnArgs>(args: SelectSubset<T, ExecutionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Execution.
     * @param {ExecutionUpsertArgs} args - Arguments to update or create a Execution.
     * @example
     * // Update or create a Execution
     * const execution = await prisma.execution.upsert({
     *   create: {
     *     // ... data to create a Execution
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Execution we want to update
     *   }
     * })
     */
    upsert<T extends ExecutionUpsertArgs>(args: SelectSubset<T, ExecutionUpsertArgs<ExtArgs>>): Prisma__ExecutionClient<$Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Executions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionCountArgs} args - Arguments to filter Executions to count.
     * @example
     * // Count the number of Executions
     * const count = await prisma.execution.count({
     *   where: {
     *     // ... the filter for the Executions we want to count
     *   }
     * })
    **/
    count<T extends ExecutionCountArgs>(
      args?: Subset<T, ExecutionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExecutionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Execution.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExecutionAggregateArgs>(args: Subset<T, ExecutionAggregateArgs>): Prisma.PrismaPromise<GetExecutionAggregateType<T>>

    /**
     * Group by Execution.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExecutionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExecutionGroupByArgs['orderBy'] }
        : { orderBy?: ExecutionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExecutionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExecutionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Execution model
   */
  readonly fields: ExecutionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Execution.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExecutionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    logs<T extends Execution$logsArgs<ExtArgs> = {}>(args?: Subset<T, Execution$logsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Execution model
   */
  interface ExecutionFieldRefs {
    readonly id: FieldRef<"Execution", 'String'>
    readonly workflowId: FieldRef<"Execution", 'String'>
    readonly status: FieldRef<"Execution", 'ExecutionStatus'>
    readonly currentNodeIndex: FieldRef<"Execution", 'Int'>
    readonly startedAt: FieldRef<"Execution", 'DateTime'>
    readonly finishedAt: FieldRef<"Execution", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Execution findUnique
   */
  export type ExecutionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Execution
     */
    select?: ExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Execution
     */
    omit?: ExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionInclude<ExtArgs> | null
    /**
     * Filter, which Execution to fetch.
     */
    where: ExecutionWhereUniqueInput
  }

  /**
   * Execution findUniqueOrThrow
   */
  export type ExecutionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Execution
     */
    select?: ExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Execution
     */
    omit?: ExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionInclude<ExtArgs> | null
    /**
     * Filter, which Execution to fetch.
     */
    where: ExecutionWhereUniqueInput
  }

  /**
   * Execution findFirst
   */
  export type ExecutionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Execution
     */
    select?: ExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Execution
     */
    omit?: ExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionInclude<ExtArgs> | null
    /**
     * Filter, which Execution to fetch.
     */
    where?: ExecutionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Executions to fetch.
     */
    orderBy?: ExecutionOrderByWithRelationInput | ExecutionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Executions.
     */
    cursor?: ExecutionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Executions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Executions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Executions.
     */
    distinct?: ExecutionScalarFieldEnum | ExecutionScalarFieldEnum[]
  }

  /**
   * Execution findFirstOrThrow
   */
  export type ExecutionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Execution
     */
    select?: ExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Execution
     */
    omit?: ExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionInclude<ExtArgs> | null
    /**
     * Filter, which Execution to fetch.
     */
    where?: ExecutionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Executions to fetch.
     */
    orderBy?: ExecutionOrderByWithRelationInput | ExecutionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Executions.
     */
    cursor?: ExecutionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Executions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Executions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Executions.
     */
    distinct?: ExecutionScalarFieldEnum | ExecutionScalarFieldEnum[]
  }

  /**
   * Execution findMany
   */
  export type ExecutionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Execution
     */
    select?: ExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Execution
     */
    omit?: ExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionInclude<ExtArgs> | null
    /**
     * Filter, which Executions to fetch.
     */
    where?: ExecutionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Executions to fetch.
     */
    orderBy?: ExecutionOrderByWithRelationInput | ExecutionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Executions.
     */
    cursor?: ExecutionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Executions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Executions.
     */
    skip?: number
    distinct?: ExecutionScalarFieldEnum | ExecutionScalarFieldEnum[]
  }

  /**
   * Execution create
   */
  export type ExecutionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Execution
     */
    select?: ExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Execution
     */
    omit?: ExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionInclude<ExtArgs> | null
    /**
     * The data needed to create a Execution.
     */
    data: XOR<ExecutionCreateInput, ExecutionUncheckedCreateInput>
  }

  /**
   * Execution createMany
   */
  export type ExecutionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Executions.
     */
    data: ExecutionCreateManyInput | ExecutionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Execution createManyAndReturn
   */
  export type ExecutionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Execution
     */
    select?: ExecutionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Execution
     */
    omit?: ExecutionOmit<ExtArgs> | null
    /**
     * The data used to create many Executions.
     */
    data: ExecutionCreateManyInput | ExecutionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Execution update
   */
  export type ExecutionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Execution
     */
    select?: ExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Execution
     */
    omit?: ExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionInclude<ExtArgs> | null
    /**
     * The data needed to update a Execution.
     */
    data: XOR<ExecutionUpdateInput, ExecutionUncheckedUpdateInput>
    /**
     * Choose, which Execution to update.
     */
    where: ExecutionWhereUniqueInput
  }

  /**
   * Execution updateMany
   */
  export type ExecutionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Executions.
     */
    data: XOR<ExecutionUpdateManyMutationInput, ExecutionUncheckedUpdateManyInput>
    /**
     * Filter which Executions to update
     */
    where?: ExecutionWhereInput
    /**
     * Limit how many Executions to update.
     */
    limit?: number
  }

  /**
   * Execution updateManyAndReturn
   */
  export type ExecutionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Execution
     */
    select?: ExecutionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Execution
     */
    omit?: ExecutionOmit<ExtArgs> | null
    /**
     * The data used to update Executions.
     */
    data: XOR<ExecutionUpdateManyMutationInput, ExecutionUncheckedUpdateManyInput>
    /**
     * Filter which Executions to update
     */
    where?: ExecutionWhereInput
    /**
     * Limit how many Executions to update.
     */
    limit?: number
  }

  /**
   * Execution upsert
   */
  export type ExecutionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Execution
     */
    select?: ExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Execution
     */
    omit?: ExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionInclude<ExtArgs> | null
    /**
     * The filter to search for the Execution to update in case it exists.
     */
    where: ExecutionWhereUniqueInput
    /**
     * In case the Execution found by the `where` argument doesn't exist, create a new Execution with this data.
     */
    create: XOR<ExecutionCreateInput, ExecutionUncheckedCreateInput>
    /**
     * In case the Execution was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExecutionUpdateInput, ExecutionUncheckedUpdateInput>
  }

  /**
   * Execution delete
   */
  export type ExecutionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Execution
     */
    select?: ExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Execution
     */
    omit?: ExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionInclude<ExtArgs> | null
    /**
     * Filter which Execution to delete.
     */
    where: ExecutionWhereUniqueInput
  }

  /**
   * Execution deleteMany
   */
  export type ExecutionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Executions to delete
     */
    where?: ExecutionWhereInput
    /**
     * Limit how many Executions to delete.
     */
    limit?: number
  }

  /**
   * Execution.logs
   */
  export type Execution$logsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionLog
     */
    select?: ExecutionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionLog
     */
    omit?: ExecutionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionLogInclude<ExtArgs> | null
    where?: ExecutionLogWhereInput
    orderBy?: ExecutionLogOrderByWithRelationInput | ExecutionLogOrderByWithRelationInput[]
    cursor?: ExecutionLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ExecutionLogScalarFieldEnum | ExecutionLogScalarFieldEnum[]
  }

  /**
   * Execution without action
   */
  export type ExecutionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Execution
     */
    select?: ExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Execution
     */
    omit?: ExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionInclude<ExtArgs> | null
  }


  /**
   * Model ExecutionLog
   */

  export type AggregateExecutionLog = {
    _count: ExecutionLogCountAggregateOutputType | null
    _avg: ExecutionLogAvgAggregateOutputType | null
    _sum: ExecutionLogSumAggregateOutputType | null
    _min: ExecutionLogMinAggregateOutputType | null
    _max: ExecutionLogMaxAggregateOutputType | null
  }

  export type ExecutionLogAvgAggregateOutputType = {
    nodeIndex: number | null
    attempt: number | null
    durationMs: number | null
  }

  export type ExecutionLogSumAggregateOutputType = {
    nodeIndex: number | null
    attempt: number | null
    durationMs: number | null
  }

  export type ExecutionLogMinAggregateOutputType = {
    id: string | null
    executionId: string | null
    nodeIndex: number | null
    nodeId: string | null
    nodeName: string | null
    error: string | null
    status: $Enums.LogStatus | null
    attempt: number | null
    startedAt: Date | null
    finishedAt: Date | null
    durationMs: number | null
  }

  export type ExecutionLogMaxAggregateOutputType = {
    id: string | null
    executionId: string | null
    nodeIndex: number | null
    nodeId: string | null
    nodeName: string | null
    error: string | null
    status: $Enums.LogStatus | null
    attempt: number | null
    startedAt: Date | null
    finishedAt: Date | null
    durationMs: number | null
  }

  export type ExecutionLogCountAggregateOutputType = {
    id: number
    executionId: number
    nodeIndex: number
    nodeId: number
    nodeName: number
    input: number
    output: number
    error: number
    status: number
    attempt: number
    startedAt: number
    finishedAt: number
    durationMs: number
    _all: number
  }


  export type ExecutionLogAvgAggregateInputType = {
    nodeIndex?: true
    attempt?: true
    durationMs?: true
  }

  export type ExecutionLogSumAggregateInputType = {
    nodeIndex?: true
    attempt?: true
    durationMs?: true
  }

  export type ExecutionLogMinAggregateInputType = {
    id?: true
    executionId?: true
    nodeIndex?: true
    nodeId?: true
    nodeName?: true
    error?: true
    status?: true
    attempt?: true
    startedAt?: true
    finishedAt?: true
    durationMs?: true
  }

  export type ExecutionLogMaxAggregateInputType = {
    id?: true
    executionId?: true
    nodeIndex?: true
    nodeId?: true
    nodeName?: true
    error?: true
    status?: true
    attempt?: true
    startedAt?: true
    finishedAt?: true
    durationMs?: true
  }

  export type ExecutionLogCountAggregateInputType = {
    id?: true
    executionId?: true
    nodeIndex?: true
    nodeId?: true
    nodeName?: true
    input?: true
    output?: true
    error?: true
    status?: true
    attempt?: true
    startedAt?: true
    finishedAt?: true
    durationMs?: true
    _all?: true
  }

  export type ExecutionLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ExecutionLog to aggregate.
     */
    where?: ExecutionLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExecutionLogs to fetch.
     */
    orderBy?: ExecutionLogOrderByWithRelationInput | ExecutionLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExecutionLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExecutionLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExecutionLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ExecutionLogs
    **/
    _count?: true | ExecutionLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ExecutionLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ExecutionLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExecutionLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExecutionLogMaxAggregateInputType
  }

  export type GetExecutionLogAggregateType<T extends ExecutionLogAggregateArgs> = {
        [P in keyof T & keyof AggregateExecutionLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExecutionLog[P]>
      : GetScalarType<T[P], AggregateExecutionLog[P]>
  }




  export type ExecutionLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExecutionLogWhereInput
    orderBy?: ExecutionLogOrderByWithAggregationInput | ExecutionLogOrderByWithAggregationInput[]
    by: ExecutionLogScalarFieldEnum[] | ExecutionLogScalarFieldEnum
    having?: ExecutionLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExecutionLogCountAggregateInputType | true
    _avg?: ExecutionLogAvgAggregateInputType
    _sum?: ExecutionLogSumAggregateInputType
    _min?: ExecutionLogMinAggregateInputType
    _max?: ExecutionLogMaxAggregateInputType
  }

  export type ExecutionLogGroupByOutputType = {
    id: string
    executionId: string
    nodeIndex: number
    nodeId: string
    nodeName: string
    input: JsonValue
    output: JsonValue | null
    error: string | null
    status: $Enums.LogStatus
    attempt: number
    startedAt: Date
    finishedAt: Date | null
    durationMs: number | null
    _count: ExecutionLogCountAggregateOutputType | null
    _avg: ExecutionLogAvgAggregateOutputType | null
    _sum: ExecutionLogSumAggregateOutputType | null
    _min: ExecutionLogMinAggregateOutputType | null
    _max: ExecutionLogMaxAggregateOutputType | null
  }

  type GetExecutionLogGroupByPayload<T extends ExecutionLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExecutionLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExecutionLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExecutionLogGroupByOutputType[P]>
            : GetScalarType<T[P], ExecutionLogGroupByOutputType[P]>
        }
      >
    >


  export type ExecutionLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    executionId?: boolean
    nodeIndex?: boolean
    nodeId?: boolean
    nodeName?: boolean
    input?: boolean
    output?: boolean
    error?: boolean
    status?: boolean
    attempt?: boolean
    startedAt?: boolean
    finishedAt?: boolean
    durationMs?: boolean
    execution?: boolean | ExecutionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["executionLog"]>

  export type ExecutionLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    executionId?: boolean
    nodeIndex?: boolean
    nodeId?: boolean
    nodeName?: boolean
    input?: boolean
    output?: boolean
    error?: boolean
    status?: boolean
    attempt?: boolean
    startedAt?: boolean
    finishedAt?: boolean
    durationMs?: boolean
    execution?: boolean | ExecutionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["executionLog"]>

  export type ExecutionLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    executionId?: boolean
    nodeIndex?: boolean
    nodeId?: boolean
    nodeName?: boolean
    input?: boolean
    output?: boolean
    error?: boolean
    status?: boolean
    attempt?: boolean
    startedAt?: boolean
    finishedAt?: boolean
    durationMs?: boolean
    execution?: boolean | ExecutionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["executionLog"]>

  export type ExecutionLogSelectScalar = {
    id?: boolean
    executionId?: boolean
    nodeIndex?: boolean
    nodeId?: boolean
    nodeName?: boolean
    input?: boolean
    output?: boolean
    error?: boolean
    status?: boolean
    attempt?: boolean
    startedAt?: boolean
    finishedAt?: boolean
    durationMs?: boolean
  }

  export type ExecutionLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "executionId" | "nodeIndex" | "nodeId" | "nodeName" | "input" | "output" | "error" | "status" | "attempt" | "startedAt" | "finishedAt" | "durationMs", ExtArgs["result"]["executionLog"]>
  export type ExecutionLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    execution?: boolean | ExecutionDefaultArgs<ExtArgs>
  }
  export type ExecutionLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    execution?: boolean | ExecutionDefaultArgs<ExtArgs>
  }
  export type ExecutionLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    execution?: boolean | ExecutionDefaultArgs<ExtArgs>
  }

  export type $ExecutionLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ExecutionLog"
    objects: {
      execution: Prisma.$ExecutionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      executionId: string
      nodeIndex: number
      nodeId: string
      nodeName: string
      input: Prisma.JsonValue
      output: Prisma.JsonValue | null
      error: string | null
      status: $Enums.LogStatus
      attempt: number
      startedAt: Date
      finishedAt: Date | null
      durationMs: number | null
    }, ExtArgs["result"]["executionLog"]>
    composites: {}
  }

  type ExecutionLogGetPayload<S extends boolean | null | undefined | ExecutionLogDefaultArgs> = $Result.GetResult<Prisma.$ExecutionLogPayload, S>

  type ExecutionLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ExecutionLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ExecutionLogCountAggregateInputType | true
    }

  export interface ExecutionLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ExecutionLog'], meta: { name: 'ExecutionLog' } }
    /**
     * Find zero or one ExecutionLog that matches the filter.
     * @param {ExecutionLogFindUniqueArgs} args - Arguments to find a ExecutionLog
     * @example
     * // Get one ExecutionLog
     * const executionLog = await prisma.executionLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExecutionLogFindUniqueArgs>(args: SelectSubset<T, ExecutionLogFindUniqueArgs<ExtArgs>>): Prisma__ExecutionLogClient<$Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ExecutionLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ExecutionLogFindUniqueOrThrowArgs} args - Arguments to find a ExecutionLog
     * @example
     * // Get one ExecutionLog
     * const executionLog = await prisma.executionLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExecutionLogFindUniqueOrThrowArgs>(args: SelectSubset<T, ExecutionLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExecutionLogClient<$Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ExecutionLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionLogFindFirstArgs} args - Arguments to find a ExecutionLog
     * @example
     * // Get one ExecutionLog
     * const executionLog = await prisma.executionLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExecutionLogFindFirstArgs>(args?: SelectSubset<T, ExecutionLogFindFirstArgs<ExtArgs>>): Prisma__ExecutionLogClient<$Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ExecutionLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionLogFindFirstOrThrowArgs} args - Arguments to find a ExecutionLog
     * @example
     * // Get one ExecutionLog
     * const executionLog = await prisma.executionLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExecutionLogFindFirstOrThrowArgs>(args?: SelectSubset<T, ExecutionLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExecutionLogClient<$Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ExecutionLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ExecutionLogs
     * const executionLogs = await prisma.executionLog.findMany()
     * 
     * // Get first 10 ExecutionLogs
     * const executionLogs = await prisma.executionLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const executionLogWithIdOnly = await prisma.executionLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ExecutionLogFindManyArgs>(args?: SelectSubset<T, ExecutionLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ExecutionLog.
     * @param {ExecutionLogCreateArgs} args - Arguments to create a ExecutionLog.
     * @example
     * // Create one ExecutionLog
     * const ExecutionLog = await prisma.executionLog.create({
     *   data: {
     *     // ... data to create a ExecutionLog
     *   }
     * })
     * 
     */
    create<T extends ExecutionLogCreateArgs>(args: SelectSubset<T, ExecutionLogCreateArgs<ExtArgs>>): Prisma__ExecutionLogClient<$Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ExecutionLogs.
     * @param {ExecutionLogCreateManyArgs} args - Arguments to create many ExecutionLogs.
     * @example
     * // Create many ExecutionLogs
     * const executionLog = await prisma.executionLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExecutionLogCreateManyArgs>(args?: SelectSubset<T, ExecutionLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ExecutionLogs and returns the data saved in the database.
     * @param {ExecutionLogCreateManyAndReturnArgs} args - Arguments to create many ExecutionLogs.
     * @example
     * // Create many ExecutionLogs
     * const executionLog = await prisma.executionLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ExecutionLogs and only return the `id`
     * const executionLogWithIdOnly = await prisma.executionLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExecutionLogCreateManyAndReturnArgs>(args?: SelectSubset<T, ExecutionLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ExecutionLog.
     * @param {ExecutionLogDeleteArgs} args - Arguments to delete one ExecutionLog.
     * @example
     * // Delete one ExecutionLog
     * const ExecutionLog = await prisma.executionLog.delete({
     *   where: {
     *     // ... filter to delete one ExecutionLog
     *   }
     * })
     * 
     */
    delete<T extends ExecutionLogDeleteArgs>(args: SelectSubset<T, ExecutionLogDeleteArgs<ExtArgs>>): Prisma__ExecutionLogClient<$Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ExecutionLog.
     * @param {ExecutionLogUpdateArgs} args - Arguments to update one ExecutionLog.
     * @example
     * // Update one ExecutionLog
     * const executionLog = await prisma.executionLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExecutionLogUpdateArgs>(args: SelectSubset<T, ExecutionLogUpdateArgs<ExtArgs>>): Prisma__ExecutionLogClient<$Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ExecutionLogs.
     * @param {ExecutionLogDeleteManyArgs} args - Arguments to filter ExecutionLogs to delete.
     * @example
     * // Delete a few ExecutionLogs
     * const { count } = await prisma.executionLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExecutionLogDeleteManyArgs>(args?: SelectSubset<T, ExecutionLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ExecutionLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ExecutionLogs
     * const executionLog = await prisma.executionLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExecutionLogUpdateManyArgs>(args: SelectSubset<T, ExecutionLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ExecutionLogs and returns the data updated in the database.
     * @param {ExecutionLogUpdateManyAndReturnArgs} args - Arguments to update many ExecutionLogs.
     * @example
     * // Update many ExecutionLogs
     * const executionLog = await prisma.executionLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ExecutionLogs and only return the `id`
     * const executionLogWithIdOnly = await prisma.executionLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ExecutionLogUpdateManyAndReturnArgs>(args: SelectSubset<T, ExecutionLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ExecutionLog.
     * @param {ExecutionLogUpsertArgs} args - Arguments to update or create a ExecutionLog.
     * @example
     * // Update or create a ExecutionLog
     * const executionLog = await prisma.executionLog.upsert({
     *   create: {
     *     // ... data to create a ExecutionLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ExecutionLog we want to update
     *   }
     * })
     */
    upsert<T extends ExecutionLogUpsertArgs>(args: SelectSubset<T, ExecutionLogUpsertArgs<ExtArgs>>): Prisma__ExecutionLogClient<$Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ExecutionLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionLogCountArgs} args - Arguments to filter ExecutionLogs to count.
     * @example
     * // Count the number of ExecutionLogs
     * const count = await prisma.executionLog.count({
     *   where: {
     *     // ... the filter for the ExecutionLogs we want to count
     *   }
     * })
    **/
    count<T extends ExecutionLogCountArgs>(
      args?: Subset<T, ExecutionLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExecutionLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ExecutionLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExecutionLogAggregateArgs>(args: Subset<T, ExecutionLogAggregateArgs>): Prisma.PrismaPromise<GetExecutionLogAggregateType<T>>

    /**
     * Group by ExecutionLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExecutionLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExecutionLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExecutionLogGroupByArgs['orderBy'] }
        : { orderBy?: ExecutionLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExecutionLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExecutionLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ExecutionLog model
   */
  readonly fields: ExecutionLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ExecutionLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExecutionLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    execution<T extends ExecutionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ExecutionDefaultArgs<ExtArgs>>): Prisma__ExecutionClient<$Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ExecutionLog model
   */
  interface ExecutionLogFieldRefs {
    readonly id: FieldRef<"ExecutionLog", 'String'>
    readonly executionId: FieldRef<"ExecutionLog", 'String'>
    readonly nodeIndex: FieldRef<"ExecutionLog", 'Int'>
    readonly nodeId: FieldRef<"ExecutionLog", 'String'>
    readonly nodeName: FieldRef<"ExecutionLog", 'String'>
    readonly input: FieldRef<"ExecutionLog", 'Json'>
    readonly output: FieldRef<"ExecutionLog", 'Json'>
    readonly error: FieldRef<"ExecutionLog", 'String'>
    readonly status: FieldRef<"ExecutionLog", 'LogStatus'>
    readonly attempt: FieldRef<"ExecutionLog", 'Int'>
    readonly startedAt: FieldRef<"ExecutionLog", 'DateTime'>
    readonly finishedAt: FieldRef<"ExecutionLog", 'DateTime'>
    readonly durationMs: FieldRef<"ExecutionLog", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * ExecutionLog findUnique
   */
  export type ExecutionLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionLog
     */
    select?: ExecutionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionLog
     */
    omit?: ExecutionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionLogInclude<ExtArgs> | null
    /**
     * Filter, which ExecutionLog to fetch.
     */
    where: ExecutionLogWhereUniqueInput
  }

  /**
   * ExecutionLog findUniqueOrThrow
   */
  export type ExecutionLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionLog
     */
    select?: ExecutionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionLog
     */
    omit?: ExecutionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionLogInclude<ExtArgs> | null
    /**
     * Filter, which ExecutionLog to fetch.
     */
    where: ExecutionLogWhereUniqueInput
  }

  /**
   * ExecutionLog findFirst
   */
  export type ExecutionLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionLog
     */
    select?: ExecutionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionLog
     */
    omit?: ExecutionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionLogInclude<ExtArgs> | null
    /**
     * Filter, which ExecutionLog to fetch.
     */
    where?: ExecutionLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExecutionLogs to fetch.
     */
    orderBy?: ExecutionLogOrderByWithRelationInput | ExecutionLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ExecutionLogs.
     */
    cursor?: ExecutionLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExecutionLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExecutionLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ExecutionLogs.
     */
    distinct?: ExecutionLogScalarFieldEnum | ExecutionLogScalarFieldEnum[]
  }

  /**
   * ExecutionLog findFirstOrThrow
   */
  export type ExecutionLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionLog
     */
    select?: ExecutionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionLog
     */
    omit?: ExecutionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionLogInclude<ExtArgs> | null
    /**
     * Filter, which ExecutionLog to fetch.
     */
    where?: ExecutionLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExecutionLogs to fetch.
     */
    orderBy?: ExecutionLogOrderByWithRelationInput | ExecutionLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ExecutionLogs.
     */
    cursor?: ExecutionLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExecutionLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExecutionLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ExecutionLogs.
     */
    distinct?: ExecutionLogScalarFieldEnum | ExecutionLogScalarFieldEnum[]
  }

  /**
   * ExecutionLog findMany
   */
  export type ExecutionLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionLog
     */
    select?: ExecutionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionLog
     */
    omit?: ExecutionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionLogInclude<ExtArgs> | null
    /**
     * Filter, which ExecutionLogs to fetch.
     */
    where?: ExecutionLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExecutionLogs to fetch.
     */
    orderBy?: ExecutionLogOrderByWithRelationInput | ExecutionLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ExecutionLogs.
     */
    cursor?: ExecutionLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExecutionLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExecutionLogs.
     */
    skip?: number
    distinct?: ExecutionLogScalarFieldEnum | ExecutionLogScalarFieldEnum[]
  }

  /**
   * ExecutionLog create
   */
  export type ExecutionLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionLog
     */
    select?: ExecutionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionLog
     */
    omit?: ExecutionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionLogInclude<ExtArgs> | null
    /**
     * The data needed to create a ExecutionLog.
     */
    data: XOR<ExecutionLogCreateInput, ExecutionLogUncheckedCreateInput>
  }

  /**
   * ExecutionLog createMany
   */
  export type ExecutionLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ExecutionLogs.
     */
    data: ExecutionLogCreateManyInput | ExecutionLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ExecutionLog createManyAndReturn
   */
  export type ExecutionLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionLog
     */
    select?: ExecutionLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionLog
     */
    omit?: ExecutionLogOmit<ExtArgs> | null
    /**
     * The data used to create many ExecutionLogs.
     */
    data: ExecutionLogCreateManyInput | ExecutionLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ExecutionLog update
   */
  export type ExecutionLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionLog
     */
    select?: ExecutionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionLog
     */
    omit?: ExecutionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionLogInclude<ExtArgs> | null
    /**
     * The data needed to update a ExecutionLog.
     */
    data: XOR<ExecutionLogUpdateInput, ExecutionLogUncheckedUpdateInput>
    /**
     * Choose, which ExecutionLog to update.
     */
    where: ExecutionLogWhereUniqueInput
  }

  /**
   * ExecutionLog updateMany
   */
  export type ExecutionLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ExecutionLogs.
     */
    data: XOR<ExecutionLogUpdateManyMutationInput, ExecutionLogUncheckedUpdateManyInput>
    /**
     * Filter which ExecutionLogs to update
     */
    where?: ExecutionLogWhereInput
    /**
     * Limit how many ExecutionLogs to update.
     */
    limit?: number
  }

  /**
   * ExecutionLog updateManyAndReturn
   */
  export type ExecutionLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionLog
     */
    select?: ExecutionLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionLog
     */
    omit?: ExecutionLogOmit<ExtArgs> | null
    /**
     * The data used to update ExecutionLogs.
     */
    data: XOR<ExecutionLogUpdateManyMutationInput, ExecutionLogUncheckedUpdateManyInput>
    /**
     * Filter which ExecutionLogs to update
     */
    where?: ExecutionLogWhereInput
    /**
     * Limit how many ExecutionLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ExecutionLog upsert
   */
  export type ExecutionLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionLog
     */
    select?: ExecutionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionLog
     */
    omit?: ExecutionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionLogInclude<ExtArgs> | null
    /**
     * The filter to search for the ExecutionLog to update in case it exists.
     */
    where: ExecutionLogWhereUniqueInput
    /**
     * In case the ExecutionLog found by the `where` argument doesn't exist, create a new ExecutionLog with this data.
     */
    create: XOR<ExecutionLogCreateInput, ExecutionLogUncheckedCreateInput>
    /**
     * In case the ExecutionLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExecutionLogUpdateInput, ExecutionLogUncheckedUpdateInput>
  }

  /**
   * ExecutionLog delete
   */
  export type ExecutionLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionLog
     */
    select?: ExecutionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionLog
     */
    omit?: ExecutionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionLogInclude<ExtArgs> | null
    /**
     * Filter which ExecutionLog to delete.
     */
    where: ExecutionLogWhereUniqueInput
  }

  /**
   * ExecutionLog deleteMany
   */
  export type ExecutionLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ExecutionLogs to delete
     */
    where?: ExecutionLogWhereInput
    /**
     * Limit how many ExecutionLogs to delete.
     */
    limit?: number
  }

  /**
   * ExecutionLog without action
   */
  export type ExecutionLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExecutionLog
     */
    select?: ExecutionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ExecutionLog
     */
    omit?: ExecutionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExecutionLogInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ExecutionScalarFieldEnum: {
    id: 'id',
    workflowId: 'workflowId',
    status: 'status',
    currentNodeIndex: 'currentNodeIndex',
    startedAt: 'startedAt',
    finishedAt: 'finishedAt'
  };

  export type ExecutionScalarFieldEnum = (typeof ExecutionScalarFieldEnum)[keyof typeof ExecutionScalarFieldEnum]


  export const ExecutionLogScalarFieldEnum: {
    id: 'id',
    executionId: 'executionId',
    nodeIndex: 'nodeIndex',
    nodeId: 'nodeId',
    nodeName: 'nodeName',
    input: 'input',
    output: 'output',
    error: 'error',
    status: 'status',
    attempt: 'attempt',
    startedAt: 'startedAt',
    finishedAt: 'finishedAt',
    durationMs: 'durationMs'
  };

  export type ExecutionLogScalarFieldEnum = (typeof ExecutionLogScalarFieldEnum)[keyof typeof ExecutionLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'ExecutionStatus'
   */
  export type EnumExecutionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ExecutionStatus'>
    


  /**
   * Reference to a field of type 'ExecutionStatus[]'
   */
  export type ListEnumExecutionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ExecutionStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'LogStatus'
   */
  export type EnumLogStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LogStatus'>
    


  /**
   * Reference to a field of type 'LogStatus[]'
   */
  export type ListEnumLogStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LogStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ExecutionWhereInput = {
    AND?: ExecutionWhereInput | ExecutionWhereInput[]
    OR?: ExecutionWhereInput[]
    NOT?: ExecutionWhereInput | ExecutionWhereInput[]
    id?: StringFilter<"Execution"> | string
    workflowId?: StringFilter<"Execution"> | string
    status?: EnumExecutionStatusFilter<"Execution"> | $Enums.ExecutionStatus
    currentNodeIndex?: IntFilter<"Execution"> | number
    startedAt?: DateTimeFilter<"Execution"> | Date | string
    finishedAt?: DateTimeNullableFilter<"Execution"> | Date | string | null
    logs?: ExecutionLogListRelationFilter
  }

  export type ExecutionOrderByWithRelationInput = {
    id?: SortOrder
    workflowId?: SortOrder
    status?: SortOrder
    currentNodeIndex?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrderInput | SortOrder
    logs?: ExecutionLogOrderByRelationAggregateInput
  }

  export type ExecutionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ExecutionWhereInput | ExecutionWhereInput[]
    OR?: ExecutionWhereInput[]
    NOT?: ExecutionWhereInput | ExecutionWhereInput[]
    workflowId?: StringFilter<"Execution"> | string
    status?: EnumExecutionStatusFilter<"Execution"> | $Enums.ExecutionStatus
    currentNodeIndex?: IntFilter<"Execution"> | number
    startedAt?: DateTimeFilter<"Execution"> | Date | string
    finishedAt?: DateTimeNullableFilter<"Execution"> | Date | string | null
    logs?: ExecutionLogListRelationFilter
  }, "id">

  export type ExecutionOrderByWithAggregationInput = {
    id?: SortOrder
    workflowId?: SortOrder
    status?: SortOrder
    currentNodeIndex?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrderInput | SortOrder
    _count?: ExecutionCountOrderByAggregateInput
    _avg?: ExecutionAvgOrderByAggregateInput
    _max?: ExecutionMaxOrderByAggregateInput
    _min?: ExecutionMinOrderByAggregateInput
    _sum?: ExecutionSumOrderByAggregateInput
  }

  export type ExecutionScalarWhereWithAggregatesInput = {
    AND?: ExecutionScalarWhereWithAggregatesInput | ExecutionScalarWhereWithAggregatesInput[]
    OR?: ExecutionScalarWhereWithAggregatesInput[]
    NOT?: ExecutionScalarWhereWithAggregatesInput | ExecutionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Execution"> | string
    workflowId?: StringWithAggregatesFilter<"Execution"> | string
    status?: EnumExecutionStatusWithAggregatesFilter<"Execution"> | $Enums.ExecutionStatus
    currentNodeIndex?: IntWithAggregatesFilter<"Execution"> | number
    startedAt?: DateTimeWithAggregatesFilter<"Execution"> | Date | string
    finishedAt?: DateTimeNullableWithAggregatesFilter<"Execution"> | Date | string | null
  }

  export type ExecutionLogWhereInput = {
    AND?: ExecutionLogWhereInput | ExecutionLogWhereInput[]
    OR?: ExecutionLogWhereInput[]
    NOT?: ExecutionLogWhereInput | ExecutionLogWhereInput[]
    id?: StringFilter<"ExecutionLog"> | string
    executionId?: StringFilter<"ExecutionLog"> | string
    nodeIndex?: IntFilter<"ExecutionLog"> | number
    nodeId?: StringFilter<"ExecutionLog"> | string
    nodeName?: StringFilter<"ExecutionLog"> | string
    input?: JsonFilter<"ExecutionLog">
    output?: JsonNullableFilter<"ExecutionLog">
    error?: StringNullableFilter<"ExecutionLog"> | string | null
    status?: EnumLogStatusFilter<"ExecutionLog"> | $Enums.LogStatus
    attempt?: IntFilter<"ExecutionLog"> | number
    startedAt?: DateTimeFilter<"ExecutionLog"> | Date | string
    finishedAt?: DateTimeNullableFilter<"ExecutionLog"> | Date | string | null
    durationMs?: IntNullableFilter<"ExecutionLog"> | number | null
    execution?: XOR<ExecutionScalarRelationFilter, ExecutionWhereInput>
  }

  export type ExecutionLogOrderByWithRelationInput = {
    id?: SortOrder
    executionId?: SortOrder
    nodeIndex?: SortOrder
    nodeId?: SortOrder
    nodeName?: SortOrder
    input?: SortOrder
    output?: SortOrderInput | SortOrder
    error?: SortOrderInput | SortOrder
    status?: SortOrder
    attempt?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrderInput | SortOrder
    durationMs?: SortOrderInput | SortOrder
    execution?: ExecutionOrderByWithRelationInput
  }

  export type ExecutionLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ExecutionLogWhereInput | ExecutionLogWhereInput[]
    OR?: ExecutionLogWhereInput[]
    NOT?: ExecutionLogWhereInput | ExecutionLogWhereInput[]
    executionId?: StringFilter<"ExecutionLog"> | string
    nodeIndex?: IntFilter<"ExecutionLog"> | number
    nodeId?: StringFilter<"ExecutionLog"> | string
    nodeName?: StringFilter<"ExecutionLog"> | string
    input?: JsonFilter<"ExecutionLog">
    output?: JsonNullableFilter<"ExecutionLog">
    error?: StringNullableFilter<"ExecutionLog"> | string | null
    status?: EnumLogStatusFilter<"ExecutionLog"> | $Enums.LogStatus
    attempt?: IntFilter<"ExecutionLog"> | number
    startedAt?: DateTimeFilter<"ExecutionLog"> | Date | string
    finishedAt?: DateTimeNullableFilter<"ExecutionLog"> | Date | string | null
    durationMs?: IntNullableFilter<"ExecutionLog"> | number | null
    execution?: XOR<ExecutionScalarRelationFilter, ExecutionWhereInput>
  }, "id">

  export type ExecutionLogOrderByWithAggregationInput = {
    id?: SortOrder
    executionId?: SortOrder
    nodeIndex?: SortOrder
    nodeId?: SortOrder
    nodeName?: SortOrder
    input?: SortOrder
    output?: SortOrderInput | SortOrder
    error?: SortOrderInput | SortOrder
    status?: SortOrder
    attempt?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrderInput | SortOrder
    durationMs?: SortOrderInput | SortOrder
    _count?: ExecutionLogCountOrderByAggregateInput
    _avg?: ExecutionLogAvgOrderByAggregateInput
    _max?: ExecutionLogMaxOrderByAggregateInput
    _min?: ExecutionLogMinOrderByAggregateInput
    _sum?: ExecutionLogSumOrderByAggregateInput
  }

  export type ExecutionLogScalarWhereWithAggregatesInput = {
    AND?: ExecutionLogScalarWhereWithAggregatesInput | ExecutionLogScalarWhereWithAggregatesInput[]
    OR?: ExecutionLogScalarWhereWithAggregatesInput[]
    NOT?: ExecutionLogScalarWhereWithAggregatesInput | ExecutionLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ExecutionLog"> | string
    executionId?: StringWithAggregatesFilter<"ExecutionLog"> | string
    nodeIndex?: IntWithAggregatesFilter<"ExecutionLog"> | number
    nodeId?: StringWithAggregatesFilter<"ExecutionLog"> | string
    nodeName?: StringWithAggregatesFilter<"ExecutionLog"> | string
    input?: JsonWithAggregatesFilter<"ExecutionLog">
    output?: JsonNullableWithAggregatesFilter<"ExecutionLog">
    error?: StringNullableWithAggregatesFilter<"ExecutionLog"> | string | null
    status?: EnumLogStatusWithAggregatesFilter<"ExecutionLog"> | $Enums.LogStatus
    attempt?: IntWithAggregatesFilter<"ExecutionLog"> | number
    startedAt?: DateTimeWithAggregatesFilter<"ExecutionLog"> | Date | string
    finishedAt?: DateTimeNullableWithAggregatesFilter<"ExecutionLog"> | Date | string | null
    durationMs?: IntNullableWithAggregatesFilter<"ExecutionLog"> | number | null
  }

  export type ExecutionCreateInput = {
    id?: string
    workflowId: string
    status?: $Enums.ExecutionStatus
    currentNodeIndex?: number
    startedAt?: Date | string
    finishedAt?: Date | string | null
    logs?: ExecutionLogCreateNestedManyWithoutExecutionInput
  }

  export type ExecutionUncheckedCreateInput = {
    id?: string
    workflowId: string
    status?: $Enums.ExecutionStatus
    currentNodeIndex?: number
    startedAt?: Date | string
    finishedAt?: Date | string | null
    logs?: ExecutionLogUncheckedCreateNestedManyWithoutExecutionInput
  }

  export type ExecutionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    workflowId?: StringFieldUpdateOperationsInput | string
    status?: EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus
    currentNodeIndex?: IntFieldUpdateOperationsInput | number
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    logs?: ExecutionLogUpdateManyWithoutExecutionNestedInput
  }

  export type ExecutionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    workflowId?: StringFieldUpdateOperationsInput | string
    status?: EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus
    currentNodeIndex?: IntFieldUpdateOperationsInput | number
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    logs?: ExecutionLogUncheckedUpdateManyWithoutExecutionNestedInput
  }

  export type ExecutionCreateManyInput = {
    id?: string
    workflowId: string
    status?: $Enums.ExecutionStatus
    currentNodeIndex?: number
    startedAt?: Date | string
    finishedAt?: Date | string | null
  }

  export type ExecutionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    workflowId?: StringFieldUpdateOperationsInput | string
    status?: EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus
    currentNodeIndex?: IntFieldUpdateOperationsInput | number
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ExecutionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    workflowId?: StringFieldUpdateOperationsInput | string
    status?: EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus
    currentNodeIndex?: IntFieldUpdateOperationsInput | number
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ExecutionLogCreateInput = {
    id?: string
    nodeIndex: number
    nodeId: string
    nodeName: string
    input: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    error?: string | null
    status?: $Enums.LogStatus
    attempt?: number
    startedAt?: Date | string
    finishedAt?: Date | string | null
    durationMs?: number | null
    execution: ExecutionCreateNestedOneWithoutLogsInput
  }

  export type ExecutionLogUncheckedCreateInput = {
    id?: string
    executionId: string
    nodeIndex: number
    nodeId: string
    nodeName: string
    input: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    error?: string | null
    status?: $Enums.LogStatus
    attempt?: number
    startedAt?: Date | string
    finishedAt?: Date | string | null
    durationMs?: number | null
  }

  export type ExecutionLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nodeIndex?: IntFieldUpdateOperationsInput | number
    nodeId?: StringFieldUpdateOperationsInput | string
    nodeName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    error?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    attempt?: IntFieldUpdateOperationsInput | number
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    execution?: ExecutionUpdateOneRequiredWithoutLogsNestedInput
  }

  export type ExecutionLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    executionId?: StringFieldUpdateOperationsInput | string
    nodeIndex?: IntFieldUpdateOperationsInput | number
    nodeId?: StringFieldUpdateOperationsInput | string
    nodeName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    error?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    attempt?: IntFieldUpdateOperationsInput | number
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ExecutionLogCreateManyInput = {
    id?: string
    executionId: string
    nodeIndex: number
    nodeId: string
    nodeName: string
    input: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    error?: string | null
    status?: $Enums.LogStatus
    attempt?: number
    startedAt?: Date | string
    finishedAt?: Date | string | null
    durationMs?: number | null
  }

  export type ExecutionLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nodeIndex?: IntFieldUpdateOperationsInput | number
    nodeId?: StringFieldUpdateOperationsInput | string
    nodeName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    error?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    attempt?: IntFieldUpdateOperationsInput | number
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ExecutionLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    executionId?: StringFieldUpdateOperationsInput | string
    nodeIndex?: IntFieldUpdateOperationsInput | number
    nodeId?: StringFieldUpdateOperationsInput | string
    nodeName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    error?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    attempt?: IntFieldUpdateOperationsInput | number
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumExecutionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionStatus | EnumExecutionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ExecutionStatus[] | ListEnumExecutionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ExecutionStatus[] | ListEnumExecutionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumExecutionStatusFilter<$PrismaModel> | $Enums.ExecutionStatus
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type ExecutionLogListRelationFilter = {
    every?: ExecutionLogWhereInput
    some?: ExecutionLogWhereInput
    none?: ExecutionLogWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ExecutionLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ExecutionCountOrderByAggregateInput = {
    id?: SortOrder
    workflowId?: SortOrder
    status?: SortOrder
    currentNodeIndex?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrder
  }

  export type ExecutionAvgOrderByAggregateInput = {
    currentNodeIndex?: SortOrder
  }

  export type ExecutionMaxOrderByAggregateInput = {
    id?: SortOrder
    workflowId?: SortOrder
    status?: SortOrder
    currentNodeIndex?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrder
  }

  export type ExecutionMinOrderByAggregateInput = {
    id?: SortOrder
    workflowId?: SortOrder
    status?: SortOrder
    currentNodeIndex?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrder
  }

  export type ExecutionSumOrderByAggregateInput = {
    currentNodeIndex?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumExecutionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionStatus | EnumExecutionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ExecutionStatus[] | ListEnumExecutionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ExecutionStatus[] | ListEnumExecutionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumExecutionStatusWithAggregatesFilter<$PrismaModel> | $Enums.ExecutionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumExecutionStatusFilter<$PrismaModel>
    _max?: NestedEnumExecutionStatusFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumLogStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.LogStatus | EnumLogStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLogStatusFilter<$PrismaModel> | $Enums.LogStatus
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type ExecutionScalarRelationFilter = {
    is?: ExecutionWhereInput
    isNot?: ExecutionWhereInput
  }

  export type ExecutionLogCountOrderByAggregateInput = {
    id?: SortOrder
    executionId?: SortOrder
    nodeIndex?: SortOrder
    nodeId?: SortOrder
    nodeName?: SortOrder
    input?: SortOrder
    output?: SortOrder
    error?: SortOrder
    status?: SortOrder
    attempt?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrder
    durationMs?: SortOrder
  }

  export type ExecutionLogAvgOrderByAggregateInput = {
    nodeIndex?: SortOrder
    attempt?: SortOrder
    durationMs?: SortOrder
  }

  export type ExecutionLogMaxOrderByAggregateInput = {
    id?: SortOrder
    executionId?: SortOrder
    nodeIndex?: SortOrder
    nodeId?: SortOrder
    nodeName?: SortOrder
    error?: SortOrder
    status?: SortOrder
    attempt?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrder
    durationMs?: SortOrder
  }

  export type ExecutionLogMinOrderByAggregateInput = {
    id?: SortOrder
    executionId?: SortOrder
    nodeIndex?: SortOrder
    nodeId?: SortOrder
    nodeName?: SortOrder
    error?: SortOrder
    status?: SortOrder
    attempt?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrder
    durationMs?: SortOrder
  }

  export type ExecutionLogSumOrderByAggregateInput = {
    nodeIndex?: SortOrder
    attempt?: SortOrder
    durationMs?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumLogStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LogStatus | EnumLogStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLogStatusWithAggregatesFilter<$PrismaModel> | $Enums.LogStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLogStatusFilter<$PrismaModel>
    _max?: NestedEnumLogStatusFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type ExecutionLogCreateNestedManyWithoutExecutionInput = {
    create?: XOR<ExecutionLogCreateWithoutExecutionInput, ExecutionLogUncheckedCreateWithoutExecutionInput> | ExecutionLogCreateWithoutExecutionInput[] | ExecutionLogUncheckedCreateWithoutExecutionInput[]
    connectOrCreate?: ExecutionLogCreateOrConnectWithoutExecutionInput | ExecutionLogCreateOrConnectWithoutExecutionInput[]
    createMany?: ExecutionLogCreateManyExecutionInputEnvelope
    connect?: ExecutionLogWhereUniqueInput | ExecutionLogWhereUniqueInput[]
  }

  export type ExecutionLogUncheckedCreateNestedManyWithoutExecutionInput = {
    create?: XOR<ExecutionLogCreateWithoutExecutionInput, ExecutionLogUncheckedCreateWithoutExecutionInput> | ExecutionLogCreateWithoutExecutionInput[] | ExecutionLogUncheckedCreateWithoutExecutionInput[]
    connectOrCreate?: ExecutionLogCreateOrConnectWithoutExecutionInput | ExecutionLogCreateOrConnectWithoutExecutionInput[]
    createMany?: ExecutionLogCreateManyExecutionInputEnvelope
    connect?: ExecutionLogWhereUniqueInput | ExecutionLogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumExecutionStatusFieldUpdateOperationsInput = {
    set?: $Enums.ExecutionStatus
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ExecutionLogUpdateManyWithoutExecutionNestedInput = {
    create?: XOR<ExecutionLogCreateWithoutExecutionInput, ExecutionLogUncheckedCreateWithoutExecutionInput> | ExecutionLogCreateWithoutExecutionInput[] | ExecutionLogUncheckedCreateWithoutExecutionInput[]
    connectOrCreate?: ExecutionLogCreateOrConnectWithoutExecutionInput | ExecutionLogCreateOrConnectWithoutExecutionInput[]
    upsert?: ExecutionLogUpsertWithWhereUniqueWithoutExecutionInput | ExecutionLogUpsertWithWhereUniqueWithoutExecutionInput[]
    createMany?: ExecutionLogCreateManyExecutionInputEnvelope
    set?: ExecutionLogWhereUniqueInput | ExecutionLogWhereUniqueInput[]
    disconnect?: ExecutionLogWhereUniqueInput | ExecutionLogWhereUniqueInput[]
    delete?: ExecutionLogWhereUniqueInput | ExecutionLogWhereUniqueInput[]
    connect?: ExecutionLogWhereUniqueInput | ExecutionLogWhereUniqueInput[]
    update?: ExecutionLogUpdateWithWhereUniqueWithoutExecutionInput | ExecutionLogUpdateWithWhereUniqueWithoutExecutionInput[]
    updateMany?: ExecutionLogUpdateManyWithWhereWithoutExecutionInput | ExecutionLogUpdateManyWithWhereWithoutExecutionInput[]
    deleteMany?: ExecutionLogScalarWhereInput | ExecutionLogScalarWhereInput[]
  }

  export type ExecutionLogUncheckedUpdateManyWithoutExecutionNestedInput = {
    create?: XOR<ExecutionLogCreateWithoutExecutionInput, ExecutionLogUncheckedCreateWithoutExecutionInput> | ExecutionLogCreateWithoutExecutionInput[] | ExecutionLogUncheckedCreateWithoutExecutionInput[]
    connectOrCreate?: ExecutionLogCreateOrConnectWithoutExecutionInput | ExecutionLogCreateOrConnectWithoutExecutionInput[]
    upsert?: ExecutionLogUpsertWithWhereUniqueWithoutExecutionInput | ExecutionLogUpsertWithWhereUniqueWithoutExecutionInput[]
    createMany?: ExecutionLogCreateManyExecutionInputEnvelope
    set?: ExecutionLogWhereUniqueInput | ExecutionLogWhereUniqueInput[]
    disconnect?: ExecutionLogWhereUniqueInput | ExecutionLogWhereUniqueInput[]
    delete?: ExecutionLogWhereUniqueInput | ExecutionLogWhereUniqueInput[]
    connect?: ExecutionLogWhereUniqueInput | ExecutionLogWhereUniqueInput[]
    update?: ExecutionLogUpdateWithWhereUniqueWithoutExecutionInput | ExecutionLogUpdateWithWhereUniqueWithoutExecutionInput[]
    updateMany?: ExecutionLogUpdateManyWithWhereWithoutExecutionInput | ExecutionLogUpdateManyWithWhereWithoutExecutionInput[]
    deleteMany?: ExecutionLogScalarWhereInput | ExecutionLogScalarWhereInput[]
  }

  export type ExecutionCreateNestedOneWithoutLogsInput = {
    create?: XOR<ExecutionCreateWithoutLogsInput, ExecutionUncheckedCreateWithoutLogsInput>
    connectOrCreate?: ExecutionCreateOrConnectWithoutLogsInput
    connect?: ExecutionWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumLogStatusFieldUpdateOperationsInput = {
    set?: $Enums.LogStatus
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ExecutionUpdateOneRequiredWithoutLogsNestedInput = {
    create?: XOR<ExecutionCreateWithoutLogsInput, ExecutionUncheckedCreateWithoutLogsInput>
    connectOrCreate?: ExecutionCreateOrConnectWithoutLogsInput
    upsert?: ExecutionUpsertWithoutLogsInput
    connect?: ExecutionWhereUniqueInput
    update?: XOR<XOR<ExecutionUpdateToOneWithWhereWithoutLogsInput, ExecutionUpdateWithoutLogsInput>, ExecutionUncheckedUpdateWithoutLogsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumExecutionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionStatus | EnumExecutionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ExecutionStatus[] | ListEnumExecutionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ExecutionStatus[] | ListEnumExecutionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumExecutionStatusFilter<$PrismaModel> | $Enums.ExecutionStatus
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumExecutionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionStatus | EnumExecutionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ExecutionStatus[] | ListEnumExecutionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ExecutionStatus[] | ListEnumExecutionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumExecutionStatusWithAggregatesFilter<$PrismaModel> | $Enums.ExecutionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumExecutionStatusFilter<$PrismaModel>
    _max?: NestedEnumExecutionStatusFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumLogStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.LogStatus | EnumLogStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLogStatusFilter<$PrismaModel> | $Enums.LogStatus
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumLogStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LogStatus | EnumLogStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLogStatusWithAggregatesFilter<$PrismaModel> | $Enums.LogStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLogStatusFilter<$PrismaModel>
    _max?: NestedEnumLogStatusFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type ExecutionLogCreateWithoutExecutionInput = {
    id?: string
    nodeIndex: number
    nodeId: string
    nodeName: string
    input: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    error?: string | null
    status?: $Enums.LogStatus
    attempt?: number
    startedAt?: Date | string
    finishedAt?: Date | string | null
    durationMs?: number | null
  }

  export type ExecutionLogUncheckedCreateWithoutExecutionInput = {
    id?: string
    nodeIndex: number
    nodeId: string
    nodeName: string
    input: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    error?: string | null
    status?: $Enums.LogStatus
    attempt?: number
    startedAt?: Date | string
    finishedAt?: Date | string | null
    durationMs?: number | null
  }

  export type ExecutionLogCreateOrConnectWithoutExecutionInput = {
    where: ExecutionLogWhereUniqueInput
    create: XOR<ExecutionLogCreateWithoutExecutionInput, ExecutionLogUncheckedCreateWithoutExecutionInput>
  }

  export type ExecutionLogCreateManyExecutionInputEnvelope = {
    data: ExecutionLogCreateManyExecutionInput | ExecutionLogCreateManyExecutionInput[]
    skipDuplicates?: boolean
  }

  export type ExecutionLogUpsertWithWhereUniqueWithoutExecutionInput = {
    where: ExecutionLogWhereUniqueInput
    update: XOR<ExecutionLogUpdateWithoutExecutionInput, ExecutionLogUncheckedUpdateWithoutExecutionInput>
    create: XOR<ExecutionLogCreateWithoutExecutionInput, ExecutionLogUncheckedCreateWithoutExecutionInput>
  }

  export type ExecutionLogUpdateWithWhereUniqueWithoutExecutionInput = {
    where: ExecutionLogWhereUniqueInput
    data: XOR<ExecutionLogUpdateWithoutExecutionInput, ExecutionLogUncheckedUpdateWithoutExecutionInput>
  }

  export type ExecutionLogUpdateManyWithWhereWithoutExecutionInput = {
    where: ExecutionLogScalarWhereInput
    data: XOR<ExecutionLogUpdateManyMutationInput, ExecutionLogUncheckedUpdateManyWithoutExecutionInput>
  }

  export type ExecutionLogScalarWhereInput = {
    AND?: ExecutionLogScalarWhereInput | ExecutionLogScalarWhereInput[]
    OR?: ExecutionLogScalarWhereInput[]
    NOT?: ExecutionLogScalarWhereInput | ExecutionLogScalarWhereInput[]
    id?: StringFilter<"ExecutionLog"> | string
    executionId?: StringFilter<"ExecutionLog"> | string
    nodeIndex?: IntFilter<"ExecutionLog"> | number
    nodeId?: StringFilter<"ExecutionLog"> | string
    nodeName?: StringFilter<"ExecutionLog"> | string
    input?: JsonFilter<"ExecutionLog">
    output?: JsonNullableFilter<"ExecutionLog">
    error?: StringNullableFilter<"ExecutionLog"> | string | null
    status?: EnumLogStatusFilter<"ExecutionLog"> | $Enums.LogStatus
    attempt?: IntFilter<"ExecutionLog"> | number
    startedAt?: DateTimeFilter<"ExecutionLog"> | Date | string
    finishedAt?: DateTimeNullableFilter<"ExecutionLog"> | Date | string | null
    durationMs?: IntNullableFilter<"ExecutionLog"> | number | null
  }

  export type ExecutionCreateWithoutLogsInput = {
    id?: string
    workflowId: string
    status?: $Enums.ExecutionStatus
    currentNodeIndex?: number
    startedAt?: Date | string
    finishedAt?: Date | string | null
  }

  export type ExecutionUncheckedCreateWithoutLogsInput = {
    id?: string
    workflowId: string
    status?: $Enums.ExecutionStatus
    currentNodeIndex?: number
    startedAt?: Date | string
    finishedAt?: Date | string | null
  }

  export type ExecutionCreateOrConnectWithoutLogsInput = {
    where: ExecutionWhereUniqueInput
    create: XOR<ExecutionCreateWithoutLogsInput, ExecutionUncheckedCreateWithoutLogsInput>
  }

  export type ExecutionUpsertWithoutLogsInput = {
    update: XOR<ExecutionUpdateWithoutLogsInput, ExecutionUncheckedUpdateWithoutLogsInput>
    create: XOR<ExecutionCreateWithoutLogsInput, ExecutionUncheckedCreateWithoutLogsInput>
    where?: ExecutionWhereInput
  }

  export type ExecutionUpdateToOneWithWhereWithoutLogsInput = {
    where?: ExecutionWhereInput
    data: XOR<ExecutionUpdateWithoutLogsInput, ExecutionUncheckedUpdateWithoutLogsInput>
  }

  export type ExecutionUpdateWithoutLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    workflowId?: StringFieldUpdateOperationsInput | string
    status?: EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus
    currentNodeIndex?: IntFieldUpdateOperationsInput | number
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ExecutionUncheckedUpdateWithoutLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    workflowId?: StringFieldUpdateOperationsInput | string
    status?: EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus
    currentNodeIndex?: IntFieldUpdateOperationsInput | number
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ExecutionLogCreateManyExecutionInput = {
    id?: string
    nodeIndex: number
    nodeId: string
    nodeName: string
    input: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    error?: string | null
    status?: $Enums.LogStatus
    attempt?: number
    startedAt?: Date | string
    finishedAt?: Date | string | null
    durationMs?: number | null
  }

  export type ExecutionLogUpdateWithoutExecutionInput = {
    id?: StringFieldUpdateOperationsInput | string
    nodeIndex?: IntFieldUpdateOperationsInput | number
    nodeId?: StringFieldUpdateOperationsInput | string
    nodeName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    error?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    attempt?: IntFieldUpdateOperationsInput | number
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ExecutionLogUncheckedUpdateWithoutExecutionInput = {
    id?: StringFieldUpdateOperationsInput | string
    nodeIndex?: IntFieldUpdateOperationsInput | number
    nodeId?: StringFieldUpdateOperationsInput | string
    nodeName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    error?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    attempt?: IntFieldUpdateOperationsInput | number
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ExecutionLogUncheckedUpdateManyWithoutExecutionInput = {
    id?: StringFieldUpdateOperationsInput | string
    nodeIndex?: IntFieldUpdateOperationsInput | number
    nodeId?: StringFieldUpdateOperationsInput | string
    nodeName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    error?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    attempt?: IntFieldUpdateOperationsInput | number
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}