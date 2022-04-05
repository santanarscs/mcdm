export interface Field {
  name: string;
  weight: number;
  max_or_min: 'max' | 'min';
}

export default class Topsis<T> {
  private readonly _list: T[];

  private readonly _fields: Field[];

  private constructor(list: T[], fields: Field[]) {
    this._fields = fields;
    this._list = list;
  }

  get fields() {
    return this._fields;
  }

  get list() {
    return this._list;
  }

  // step 1 - definição da matriz de decisão
  // eslint-disable-next-line no-shadow
  static create<T>(list: T[], fields: Field[]) {
    const totalWeight = fields.reduce((prev, curr) => prev + curr.weight, 0);
    if (totalWeight !== 1) {
      throw new Error('sum weigth must equal 1');
    }
    return new Topsis(list, fields);
  }

  // step 2 - normalização da matriz de decisão
  getNormalizedList() {
    // pega todos os valores de uma coluna, eleva ao quadrado, soma tudo e tira a raiz quadrada
    const normalization = this._fields
      .map(field => field.name)
      .map((field: string) => {
        const items = this._list
          .map(item => Number((item as any)[field]) ** 2)
          .reduce((prev: number, curr: number) => prev + curr, 0);
        return items;
      })
      .map((item: number, index: number) => {
        return {
          name: this._fields[index].name,
          norm: Math.sqrt(item),
        };
      })
      .reduce(
        (obj, item) => Object.assign(obj, { [item.name]: item.norm }),
        {},
      );

    // aplica normalização em cada item da matriz
    return this._list.map(item => {
      return {
        ...item,
        ...this._fields
          .map(field => field.name)
          .map((field: string) => {
            return {
              [field]: (item as any)[field] / (normalization as any)[field],
            };
          })
          .reduce((obj, curr) =>
            Object.assign(obj, {
              [Object.keys(curr)[0]]: curr[Object.keys(curr)[0]],
            }),
          ),
      };
    });
  }

  // 3. Construção da matriz de decisão normalizada e ponderada
  getPonderedAndNormalizedList() {
    const listNormalized = this.getNormalizedList();
    return listNormalized.map(item => {
      return {
        ...item,
        ...this._fields
          .map((field: Field) => {
            return {
              [field.name]: item[field.name] * field.weight,
            };
          })
          .reduce((obj, curr) =>
            Object.assign(obj, {
              [Object.keys(curr)[0]]: curr[Object.keys(curr)[0]],
            }),
          ),
      };
    });
  }

  // 4. definir solução ideal positiva e negativa
  getIdealAndNotIdealSolution() {
    const listNormalizedAndPondered = this.getPonderedAndNormalizedList();
    return this._fields.map((field: Field) => {
      const list = listNormalizedAndPondered.map(item => item[field.name]);
      return {
        name: field.name,
        ideal_positive:
          field.max_or_min === 'max'
            ? Math.max.apply(null, list)
            : Math.min.apply(null, list),
        ideal_negative:
          field.max_or_min === 'max'
            ? Math.min.apply(null, list)
            : Math.max.apply(null, list),
      };
    });
  }

  // 5 passo, calculando medida de distancias
  calculateDistance() {
    const idealAndNotIdealSolutions = this.getIdealAndNotIdealSolution();
    const ponderedList = this.getPonderedAndNormalizedList();

    return ponderedList.map(item => {
      const distancePositive = idealAndNotIdealSolutions
        .map(distance => {
          return (item[distance.name] - distance.ideal_positive) ** 2;
        })
        .reduce((prev, obj) => prev + obj, 0);
      const distanceNegative = idealAndNotIdealSolutions
        .map(distance => {
          return (item[distance.name] - distance.ideal_negative) ** 2;
        })
        .reduce((prev, obj) => prev + obj, 0);
      return {
        ...item,
        distancePositive: Math.sqrt(distancePositive),
        distanceNegative: Math.sqrt(distanceNegative),
      };
    });
  }

  // 6. calculando a proximidade relativa
  getListWithEpsilon() {
    const listWithDistance = this.calculateDistance();
    return listWithDistance.map(item => {
      return {
        ...item,
        epsilon:
          item.distanceNegative /
          (item.distancePositive + item.distanceNegative),
      };
    });
  }

  // 7. ordenação da lista
  getOrderedList() {
    const listWithEpsilon = this.getListWithEpsilon();
    return listWithEpsilon.sort((a, b) => b.epsilon - a.epsilon);
  }
}
