import Topsis, { Field } from '../src/Topsis';

describe('TOPSIS entity', () => {
  interface MyList {
    name: string;
    cost: number;
    deadline: number;
    speed: number;
  }
  const list: MyList[] = [
    { name: 'Prov 1', cost: 90, deadline: 20, speed: 80 },
    { name: 'Prov 2', cost: 120, deadline: 8, speed: 100 },
    { name: 'Prov 3', cost: 70, deadline: 12, speed: 90 },
  ];
  const fields: Field[] = [
    { name: 'cost', weight: 0.5, max_or_min: 'min' },
    { name: 'deadline', weight: 0.3, max_or_min: 'min' },
    { name: 'speed', weight: 0.2, max_or_min: 'max' },
  ];

  /**
    Testes:

    1. validar os pesos, a soma deve ser igual a 1
    2. validar max_or_min: deve receber somente as strings min ou max
    3. tabela normalizada deve estar entre 0 e 1
    4.


  */

  it('should be able to create a decision array', () => {
    const topsis = Topsis.create(list, fields);

    expect(topsis.list).toHaveLength(3);
    expect(topsis.fields).toHaveLength(3);
    console.log('criação do array');
    console.table(topsis.list);
  });

  it('should be able return decision array normalized', () => {
    const topsis = Topsis.create(list, fields);
    const listNormalized = topsis.getNormalizedList();
    expect(listNormalized).toHaveLength(3);
    console.log('lista normalizada');
    console.table(listNormalized);
  });

  it('should be able to return array normalized and pondered', () => {
    const topsis = Topsis.create(list, fields);
    const listNormalizedAndPondered = topsis.getPonderedAndNormalizedList();
    console.log('lista ponderada');
    console.table(listNormalizedAndPondered);
    expect(listNormalizedAndPondered).toHaveLength(3);
  });

  it('should be able to return an ideal solution positive and an ideal solution negative', () => {
    const topsis = Topsis.create(list, fields);
    const idealSolution = topsis.getIdealAndNotIdealSolution();
    console.log('solução ideal e nao ideal');
    console.table(idealSolution);
  });
  it('should be able to return distance measure', () => {
    const topsis = Topsis.create(list, fields);
    const tableWithDistance = topsis.calculateDistance();
    console.log('calcula distancia');
    console.table(tableWithDistance);
  });

  it('should be able to return list with epsilon', () => {
    const topsis = Topsis.create(list, fields);
    const tableWithEpsilon = topsis.getListWithEpsilon();
    console.log('adiciona epsilon');
    console.table(tableWithEpsilon);
  });

  it('should be able to return ordered list ', () => {
    const topsis = Topsis.create(list, fields);
    const finalList = topsis.getOrderedList();
    console.log('lista ordenada');
    console.table(finalList);
  });
});
